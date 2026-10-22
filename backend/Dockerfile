FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

# tzdata để múi giờ của container đúng khi đặt TIME_ZONE; chạy bằng user thường, không phải root
RUN apt-get update \
    && apt-get install -y --no-install-recommends tzdata \
    && rm -rf /var/lib/apt/lists/* \
    && adduser --disabled-password --gecos "" app

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY --chown=app:app . .
# Windows lưu file xuống dòng kiểu CRLF làm script .sh không chạy được trên Linux
RUN sed -i 's/\r$//' entrypoint.sh \
    && chmod +x entrypoint.sh \
    && mkdir -p media staticfiles \
    && chown app:app media staticfiles

USER app
EXPOSE 8000
ENTRYPOINT ["./entrypoint.sh"]