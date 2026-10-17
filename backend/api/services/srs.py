from datetime import date, timedelta


def calculate_sm2(quality, ease_factor, interval_days, review_count):
    if quality < 3:
        interval_days = 1
        review_count = 0
    else:
        if review_count == 0:
            interval_days = 1
        elif review_count == 1:
            interval_days = 6
        else:
            interval_days = round(interval_days * ease_factor)
        review_count += 1

    ease_factor = ease_factor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
    ease_factor = max(1.3, ease_factor)

    # Trả lời sai thì học lại ngay hôm nay, đúng thì hẹn ôn theo khoảng cách mới
    next_review_date = date.today() if quality < 3 else date.today() + timedelta(days=interval_days)

    return ease_factor, interval_days, review_count, next_review_date