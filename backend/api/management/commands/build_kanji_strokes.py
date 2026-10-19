import json
import re
import xml.etree.ElementTree as ET
import zipfile
from pathlib import Path

from django.conf import settings
from django.core.management.base import BaseCommand, CommandError

from api.models import Kanji

SVG = '{http://www.w3.org/2000/svg}'
NUMBER_POS = re.compile(r'matrix\(\s*1\s+0\s+0\s+1\s+([-\d.]+)\s+([-\d.]+)\s*\)')

README = (
    'Dữ liệu thứ tự nét kanji trong thư mục này được chuyển đổi từ KanjiVG\n'
    '(https://kanjivg.tagaini.net/), bản quyền (c) Ulrich Apel,\n'
    'phát hành theo giấy phép Creative Commons Attribution-Share Alike 3.0\n'
    '(https://creativecommons.org/licenses/by-sa/3.0/).\n\n'
    'Các file JSON ở đây là dữ liệu dẫn xuất và giữ nguyên giấy phép CC BY-SA 3.0.\n'
    'Thay đổi so với bản gốc: chuyển từ SVG sang JSON, chỉ giữ đường vẽ từng nét '
    'và vị trí số nét.\n'
)


class Command(BaseCommand):
    help = 'Tạo dữ liệu thứ tự nét (JSON) cho các kanji trong DB từ file zip của KanjiVG'

    def add_arguments(self, parser):
        parser.add_argument('zip_path', help='Đường dẫn tới file kanjivg-YYYYMMDD-main.zip')
        parser.add_argument('--out', help='Thư mục xuất (mặc định: frontend/public/kanjivg)')

    def handle(self, *args, **options):
        zip_path = Path(options['zip_path'])
        if not zip_path.is_file():
            raise CommandError(f'Không tìm thấy file: {zip_path}')

        out_dir = (
            Path(options['out']) if options['out']
            else settings.BASE_DIR.parent / 'frontend' / 'public' / 'kanjivg'
        )
        out_dir.mkdir(parents=True, exist_ok=True)

        kanji = {k.character: k for k in Kanji.objects.all() if len(k.character) == 1}
        if not kanji:
            raise CommandError('Chưa có kanji nào trong cơ sở dữ liệu, hãy chạy seed_data trước')

        written, missing, mismatched = 0, [], []
        with zipfile.ZipFile(zip_path) as archive:
            files = {Path(n).name: n for n in archive.namelist() if n.endswith('.svg')}

            for char, obj in kanji.items():
                code = f'{ord(char):05x}'  # KanjiVG đặt tên file theo mã Unicode, ví dụ 065e5.svg
                filename = f'{code}.svg'
                if filename not in files:
                    missing.append(char)
                    continue

                strokes = self._parse(archive.read(files[filename]))
                if not strokes:
                    missing.append(char)
                    continue

                payload = {'c': char, 'strokes': strokes}
                (out_dir / f'{code}.json').write_text(
                    json.dumps(payload, ensure_ascii=False, separators=(',', ':')),
                    encoding='utf-8',
                )
                written += 1
                if obj.stroke_count != len(strokes):
                    mismatched.append(f'{char} (trong DB: {obj.stroke_count}, KanjiVG: {len(strokes)})')

        (out_dir / 'README.txt').write_text(README, encoding='utf-8')

        self.stdout.write(self.style.SUCCESS(f'Đã tạo {written}/{len(kanji)} file trong {out_dir}'))
        if missing:
            self.stdout.write(self.style.WARNING(f'Không có dữ liệu cho {len(missing)} chữ: {" ".join(missing[:40])}'))
        if mismatched:
            self.stdout.write(self.style.WARNING(
                f'{len(mismatched)} chữ có số nét trong DB khác KanjiVG (nên kiểm tra lại seed): '
                + '; '.join(mismatched[:20])
            ))

    @staticmethod
    def _parse(data):
        root = ET.fromstring(data)
        paths = [p.get('d') for p in root.iter(f'{SVG}path') if p.get('d')]

        numbers = []
        for text in root.iter(f'{SVG}text'):
            match = NUMBER_POS.search(text.get('transform', ''))
            numbers.append([float(match.group(1)), float(match.group(2))] if match else None)

        strokes = []
        for i, d in enumerate(paths):
            stroke = {'d': d}
            if len(numbers) == len(paths) and numbers[i]:
                stroke['n'] = numbers[i]
            strokes.append(stroke)
        return strokes