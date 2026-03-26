TOP_SKILLS = [
    'javascript', 'python', 'java', 'react', 'node.js',
    'sql', 'mongodb', 'git', 'aws', 'docker',
    'machine learning', 'data structures', 'system design', 'rest api', 'typescript'
]

def calculate_score(student: dict) -> int:
    score = 0

    # 1. CGPA (30 pts)
    cgpa = student.get('cgpa', 0)
    if   cgpa >= 9.0: score += 30
    elif cgpa >= 8.0: score += 25
    elif cgpa >= 7.0: score += 20
    elif cgpa >= 6.0: score += 13
    elif cgpa >= 5.0: score += 8
    else:             score += 3

    # Deduct backlogs
    score -= student.get('activeBacklogs', 0) * 5

    # 2. Skills (25 pts)
    total_skills = len(student.get('technicalSkills', [])) + len(student.get('programmingLanguages', []))
    score += min(25, int(total_skills * 2.5))

    # 3. Projects (20 pts)
    projects = student.get('projects', [])
    major = sum(1 for p in projects if p.get('type') == 'major')
    minor = sum(1 for p in projects if p.get('type') == 'minor')
    score += min(20, major * 8 + minor * 3)

    # 4. Internships (15 pts)
    completed = sum(1 for i in student.get('internships', []) if i.get('isCompleted'))
    score += min(15, completed * 8)

    # 5. Certifications (10 pts)
    score += min(10, len(student.get('certifications', [])) * 3)

    return max(0, min(100, score))


def analyze_skill_gap(student: dict) -> list:
    student_skills = set(
        s.lower()
        for s in student.get('technicalSkills', []) + student.get('programmingLanguages', [])
    )
    return [s for s in TOP_SKILLS if s not in student_skills][:5]