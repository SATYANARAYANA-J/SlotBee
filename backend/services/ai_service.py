def analyze_vehicle_health(data):
    """
    Advanced AI Analysis based on user inputs.
    Inputs:
    - kms_driven (int)
    - last_service_kms (int)
    - oil_level (str: 'Low', 'Normal', 'High')
    - engine_temp (float)
    - battery_voltage (float)
    - brake_condition (int: 0-10)
    """
    score = 100
    issues = []
    recommendations = []

    kms = int(data.get('kms_driven', 0))
    last_service = int(data.get('last_service_kms', 0))
    oil = data.get('oil_level', 'Normal')
    temp = float(data.get('engine_temp', 90))
    voltage = float(data.get('battery_voltage', 12.6))
    brakes = int(data.get('brake_condition', 10))

    # 1. Service Interval Check
    service_diff = kms - last_service
    if service_diff > 10000:
        score -= 20
        issues.append("Overdue for periodic service")
        recommendations.append("Periodic Service")
    elif service_diff > 5000:
        score -= 5
        issues.append("Service due soon")

    # 2. Oil Check
    if oil == 'Low':
        score -= 25
        issues.append("Low Engine Oil")
        recommendations.append("Oil Change")
    elif oil == 'High':
        score -= 10
        issues.append("High Engine Oil Level")

    # 3. Temperature Check
    if temp > 100:
        score -= 30
        issues.append("Engine Overheating")
        recommendations.append("Engine Repair")
    
    # 4. Battery Check
    if voltage < 12.0:
        score -= 15
        issues.append("Weak Battery")
        recommendations.append("Battery Check/Replacement")
    
    # 5. Brake Check
    if brakes < 5:
        score -= 30
        issues.append("Critical Brake Wear")
        recommendations.append("Brake Service")
    elif brakes < 8:
        score -= 10
        issues.append("Brake wear detected")

    # Determine Status
    if score < 50:
        status = "Critical"
    elif score < 80:
        status = "Needs Attention"
    else:
        status = "Good"

    return {
        "health_score": score,
        "health_status": status,
        "issues_detected": issues,
        "recommendations": list(set(recommendations)) # Unique
    }
