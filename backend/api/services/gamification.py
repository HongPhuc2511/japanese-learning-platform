from datetime import date, timedelta


def record_activity(user, points=0):
    """Cộng điểm và cập nhật chuỗi ngày học cho user."""
    today = date.today()

    if user.last_study_date != today:
        if user.last_study_date == today - timedelta(days=1):
            user.streak_count += 1
        else:
            user.streak_count = 1
        user.last_study_date = today

    user.points += points
    user.save(update_fields=['points', 'streak_count', 'last_study_date'])