from django.contrib.auth import get_user_model

User = get_user_model()


def _public_name(user):
    name = user.first_name.strip()
    if name:
        return name
    if user.has_usable_password():
        return user.username  # tên đăng nhập do chính họ chọn khi đăng ký
    return 'Học viên ẩn danh'  # tài khoản Google hoặc Facebook chưa đặt tên


def _eligible():
    return User.objects.filter(is_active=True, is_superuser=False, points__gt=0)


def build_leaderboard(user, limit=10):
    eligible = _eligible()

    top, prev_points, prev_rank = [], None, 0
    ordered = eligible.order_by('-points', '-streak_count', 'id')[:limit]
    for index, u in enumerate(ordered, start=1):
        rank = prev_rank if u.points == prev_points else index  # điểm bằng nhau thì đồng hạng
        prev_points, prev_rank = u.points, rank
        top.append({
            'rank': rank,
            'name': _public_name(u),
            'points': u.points,
            'streak': u.streak_count,
            'is_me': u.id == user.id,
        })

    me_rank = None
    if user.is_active and not user.is_superuser and user.points > 0:
        me_rank = eligible.filter(points__gt=user.points).count() + 1

    return {
        'top': top,
        'me': {
            'rank': me_rank,
            'name': _public_name(user),
            'points': user.points,
            'streak': user.streak_count,
        },
        'total_players': eligible.count(),
    }