from django.db.models import Count

from api.models import Course, Lesson, UserProgress, QuizResult, FlashcardReview
from .flashcards import CARD_SOURCES, LEVEL_ORDER, review_summary


def _rank(level):
    return LEVEL_ORDER.index(level) if level in LEVEL_ORDER else len(LEVEL_ORDER)


def _completed_lessons(user):
    return set(
        UserProgress.objects.filter(user=user, is_completed=True)
        .values_list('lesson_id', flat=True)
    )


def _course_progress(completed):
    totals, done = {}, {}
    for lesson_id, course_id in Lesson.objects.values_list('id', 'course_id'):
        totals[course_id] = totals.get(course_id, 0) + 1
        if lesson_id in completed:
            done[course_id] = done.get(course_id, 0) + 1

    courses = sorted(Course.objects.all(), key=lambda c: (_rank(c.level), c.order, c.id))
    return [
        {
            'id': c.id,
            'title': c.title,
            'level': c.level,
            'completed': done.get(c.id, 0),
            'total': totals.get(c.id, 0),
        }
        for c in courses
    ]


def _next_lesson(completed):
    """Bài học chưa xong đầu tiên, xếp theo cấp độ từ N5 lên N1, rồi thứ tự khoá và bài."""
    lessons = sorted(
        Lesson.objects.select_related('course'),
        key=lambda l: (_rank(l.course.level), l.course.order, l.course_id, l.order, l.id),
    )
    for lesson in lessons:
        if lesson.id not in completed:
            return {
                'id': lesson.id,
                'title': lesson.title,
                'course_id': lesson.course_id,
                'course_title': lesson.course.title,
                'level': lesson.course.level,
            }
    return None


def _level_progress(user):
    """Với mỗi cấp độ: số từ đã học trên tổng số từ vựng và kanji."""
    stats = {level: {'learned': 0, 'total': 0} for level in LEVEL_ORDER}

    for content_type, (model, field) in CARD_SOURCES.items():
        for row in model.objects.values(field).annotate(n=Count('id')).order_by():
            if row[field] in stats:
                stats[row[field]]['total'] += row['n']

        remembered = FlashcardReview.objects.filter(
            user=user, content_type=content_type, review_count__gte=1
        ).values('object_id')
        learned = model.objects.filter(id__in=remembered).values(field).annotate(n=Count('id')).order_by()
        for row in learned:
            if row[field] in stats:
                stats[row[field]]['learned'] += row['n']

    return [{'level': level, **stats[level]} for level in LEVEL_ORDER]


def _recent_quizzes(user, limit=3):
    results = (
        QuizResult.objects.filter(user=user)
        .select_related('quiz').order_by('-completed_at')[:limit]
    )
    return [
        {
            'id': r.id,
            'quiz_id': r.quiz_id,
            'title': r.quiz.title,
            'score': r.score,
            'completed_at': r.completed_at,
        }
        for r in results
    ]


def build_dashboard(user):
    completed = _completed_lessons(user)
    return {
        'review': review_summary(user),
        'next_lesson': _next_lesson(completed),
        'courses': _course_progress(completed),
        'levels': _level_progress(user),
        'recent_quizzes': _recent_quizzes(user),
    }