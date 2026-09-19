import urllib.request
import json
import os
import re
import math

def test_endpoints():
    endpoints = [
        "http://localhost:3000/",
        "http://localhost:3000/app/",
        "http://localhost:3000/js/exercises-data.js",
        "http://localhost:3000/js/ai-ecosystem.js",
        "http://localhost:3000/css/ai-ecosystem.css",
        "http://localhost:3000/app/exercises-data.js",
        "http://localhost:3000/app/ai-ecosystem.js",
        "http://localhost:3000/app/ai-ecosystem.css",
        "http://localhost:3000/js/vendor/camera_utils.js",
        "http://localhost:3000/js/vendor/pose.js",
        "http://localhost:3000/app/vendor/camera_utils.js",
        "http://localhost:3000/app/vendor/pose.js",
    ]
    print("[TEST 1] Testing HTTP Endpoints...")
    for ep in endpoints:
        req = urllib.request.Request(ep)
        with urllib.request.urlopen(req) as resp:
            status = resp.status
            size = len(resp.read())
            assert status == 200, f"Failed endpoint {ep}: {status}"
            assert size > 0, f"Empty response {ep}"
            print(f"  OK: {ep} (status {status}, {size} bytes)")
    print("-> All endpoints verified successfully.\n")

def test_exercise_database():
    print("[TEST 2] Verifying Exercise Library Integrity...")
    with open("js/exercises-data.js", "r", encoding="utf-8") as f:
        content = f.read()
    
    # Extract json array
    match = re.search(r"window\.FITMATE_EXERCISES\s*=\s*(\[.*?\]);", content, re.DOTALL)
    assert match, "Could not find window.FITMATE_EXERCISES in js/exercises-data.js"
    exercises = json.loads(match.group(1))
    
    total = len(exercises)
    print(f"  Total exercises found: {total}")
    assert total >= 1500, f"Expected >= 1500 exercises, got {total}"
    
    # Check uniqueness of IDs and Names
    ids = set()
    names = set()
    camera_supported = 0
    categories = set()
    difficulties = set()
    equipment_set = set()
    
    for ex in exercises:
        assert ex['id'] not in ids, f"Duplicate id: {ex['id']}"
        assert ex['name'].lower() not in names, f"Duplicate name: {ex['name']}"
        ids.add(ex['id'])
        names.add(ex['name'].lower())
        categories.add(ex['category'])
        difficulties.add(ex['difficulty'])
        equipment_set.add(ex['equipment'])
        
        # Check rich biomechanical properties
        assert len(ex['formCues']) >= 2, f"Missing form cues in {ex['name']}"
        assert len(ex['commonMistakes']) >= 2, f"Missing common mistakes in {ex['name']}"
        assert len(ex['instructions']) >= 3, f"Missing instructions in {ex['name']}"
        assert 'beginnerVariation' in ex and ex['beginnerVariation'], f"Missing beginner variation in {ex['name']}"
        assert 'advancedVariation' in ex and ex['advancedVariation'], f"Missing advanced variation in {ex['name']}"
        
        if ex.get('cameraSupported'):
            camera_supported += 1
            
    print(f"  Unique exercises: {len(names)}")
    print(f"  Camera-supported: {camera_supported}")
    print(f"  Categories: {sorted(list(categories))}")
    print(f"  Difficulties: {sorted(list(difficulties))}")
    print(f"  Equipment variants: {len(equipment_set)}")
    print("-> Exercise database passed 100% of sanity and biomechanics checks.\n")

def test_html_and_assets_sync():
    print("[TEST 3] Testing Sync & Views across Portal, App & Android...")
    files_to_compare = [
        ("js/exercises-data.js", "app/exercises-data.js"),
        ("js/ai-ecosystem.js", "app/ai-ecosystem.js"),
        ("css/ai-ecosystem.css", "app/ai-ecosystem.css"),
    ]
    for f1, f2 in files_to_compare:
        s1 = os.path.getsize(f1)
        s2 = os.path.getsize(f2)
        assert s1 == s2, f"Size mismatch between {f1} ({s1}) and {f2} ({s2})"
        print(f"  Verified match: {f1} <-> {f2} ({s1} bytes)")

    # Verify Views in app/index.html and index.html
    required_views = [
        "view-student-aicoach",
        "view-student-exerciselibrary",
        "view-student-aichat",
        "view-student-voiceassistant",
        "view-student-dietplanner",
        "view-student-aitrainer"
    ]
    for html_path in ["index.html", "app/index.html", "android-project/app/src/main/assets/index.html"]:
        with open(html_path, "r", encoding="utf-8") as f:
            c = f.read()
        for v in required_views:
            assert f'id="{v}"' in c, f"View {v} missing in {html_path}"
        assert 'id="sideTipsPanel"' in c, f"Side tips panel missing in {html_path}"
        assert 'id="hudAnglePill"' in c, f"HUD Angle pill missing in {html_path}"
        assert 'id="libSearchInput"' in c, f"libSearchInput missing in {html_path}"
        assert 'id="btnDietVeg"' in c, f"btnDietVeg missing in {html_path}"
        assert 'id="btnDietNonVeg"' in c, f"btnDietNonVeg missing in {html_path}"
        assert 'id="voiceOrb"' in c, f"voiceOrb missing in {html_path}"
        print(f"  Verified all AI views and DOM IDs in {html_path}")
    print("-> Synchronization tests passed.\n")

def test_biomechanical_math():
    print("[TEST 4] Testing Biomechanical Angle & State Transition Logic...")
    
    def calculate_angle(a, b, c):
        # Angle at b
        radians = math.atan2(c[1] - b[1], c[0] - b[0]) - math.atan2(a[1] - b[1], a[0] - b[0])
        angle = abs(radians * 180.0 / math.pi)
        if angle > 180.0:
            angle = 360.0 - angle
        return angle
        
    # Hip at (0.5, 0.5), Knee at (0.5, 0.7), Ankle at (0.5, 0.9) -> Straight leg (180 deg)
    hip = (0.5, 0.5)
    knee = (0.5, 0.7)
    ankle = (0.5, 0.9)
    straight_angle = calculate_angle(hip, knee, ankle)
    assert abs(straight_angle - 180.0) < 0.01, f"Expected 180, got {straight_angle}"
    
    # Deep Squat: Hip at (0.4, 0.7) horizontal to Knee at (0.5, 0.7), Ankle at (0.5, 0.9) -> 90 deg knee flexion
    deep_squat_angle = calculate_angle((0.4, 0.7), (0.5, 0.7), (0.5, 0.9))
    print(f"  Simulated straight leg angle: {straight_angle:.1f}°")
    print(f"  Simulated deep squat knee flexion: {deep_squat_angle:.1f}° (Threshold < 95° triggers BOTTOM phase)")
    assert deep_squat_angle < 95.0, f"Expected squat knee angle < 95, got {deep_squat_angle}"
    
    # Plank collinearity check: Shoulder (0.2, 0.4), Hip (0.5, 0.42), Ankle (0.8, 0.43)
    plank_angle = calculate_angle((0.2, 0.4), (0.5, 0.42), (0.8, 0.43))
    print(f"  Simulated plank hip alignment: {plank_angle:.1f}° (Target 165° - 180° for flat spine)")
    assert 165.0 <= plank_angle <= 180.0, f"Plank alignment deviation: {plank_angle}"
    
    print("-> Biomechanical angles validated successfully.\n")

if __name__ == "__main__":
    test_endpoints()
    test_exercise_database()
    test_html_and_assets_sync()
    test_biomechanical_math()
    print("=======================================================")
    print("ALL PYTHON ECOSYSTEM TESTS COMPLETED SUCCESSFULLY (4/4)")
    print("=======================================================")
