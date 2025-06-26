import React, { useState } from 'react';
import '../styles/CourseInput.css';

const CourseInput = ({ course, onChange, index, onRemove, canRemove }) => {
    const [errors, setErrors] = useState({});

    const days = [
        { value: 'Mon', label: 'Monday' },
        { value: 'Tue', label: 'Tuesday' },
        { value: 'Wed', label: 'Wednesday' },
        { value: 'Thu', label: 'Thursday' },
        { value: 'Fri', label: 'Friday' }
    ];

    const hours = Array.from({ length: 14 }, (_, i) => {
        const hour = i + 8; // 8 AM to 9 PM
        return {
            value: hour,
            label: `${hour}:00`
        };
    });

    const validateTimeSlot = (day, startTime, endTime, type) => {
        const newErrors = { ...errors };
        const errorKey = `${type}_${index}`;

        // Clear previous errors for this slot
        delete newErrors[errorKey];

        if (day && (startTime !== '' && startTime !== null) && (endTime !== '' && endTime !== null)) {
            const start = parseInt(startTime);
            const end = parseInt(endTime);

            if (end <= start) {
                newErrors[errorKey] = 'End time must be after start time';
            } else if (end - start > 6) {
                newErrors[errorKey] = 'Class duration cannot exceed 6 hours';
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleLectureChange = (field, value) => {
        const newLecture = { ...course.lecture };
        newLecture[field] = value;

        // Validate when all fields are filled
        if (newLecture.day && newLecture.startTime !== '' && newLecture.endTime !== '') {
            validateTimeSlot(newLecture.day, newLecture.startTime, newLecture.endTime, 'lecture');
        }

        onChange(index, 'lecture', newLecture);
    };

    const handlePracticeChange = (field, value) => {
        const newPractice = { ...course.practice };
        newPractice[field] = value;

        // Validate when all fields are filled
        if (newPractice.day && newPractice.startTime !== '' && newPractice.endTime !== '') {
            validateTimeSlot(newPractice.day, newPractice.startTime, newPractice.endTime, 'practice');
        }

        onChange(index, 'practice', newPractice);
    };

    const toggleLecture = () => {
        if (course.hasLecture) {
            onChange(index, 'lecture', { day: '', startTime: '', endTime: '' });
        } else {
            onChange(index, 'lecture', { day: 'Mon', startTime: 9, endTime: 11 });
        }
        onChange(index, 'hasLecture', !course.hasLecture);
    };

    const togglePractice = () => {
        if (course.hasPractice) {
            onChange(index, 'practice', { day: '', startTime: '', endTime: '' });
        } else {
            onChange(index, 'practice', { day: 'Mon', startTime: 14, endTime: 16 });
        }
        onChange(index, 'hasPractice', !course.hasPractice);
    };

    const getAvailableEndTimes = (startTime) => {
        if (startTime === '' || startTime === null) return [];
        const start = parseInt(startTime);
        return hours.filter(hour => hour.value > start && hour.value <= start + 6);
    };

    const hasValidSession = () => {
        const lectureValid = course.hasLecture && 
            course.lecture?.day && 
            course.lecture?.startTime !== '' && 
            course.lecture?.endTime !== '' &&
            !errors[`lecture_${index}`];
            
        const practiceValid = course.hasPractice && 
            course.practice?.day && 
            course.practice?.startTime !== '' && 
            course.practice?.endTime !== '' &&
            !errors[`practice_${index}`];

        return lectureValid || practiceValid;
    };

    return (
        <div className={`course-block ${!hasValidSession() ? 'invalid' : ''}`}>
            {canRemove && (
                <button 
                    type="button"
                    className="remove-course-btn"
                    onClick={() => onRemove(index)}
                    aria-label="Remove course"
                    title="Remove this course"
                >
                    ×
                </button>
            )}
            
            <div className="input-group">
                <label className="input-label" htmlFor={`course-name-${index}`}>
                    Course Name *
                </label>
                <input
                    id={`course-name-${index}`}
                    type="text"
                    placeholder="e.g., CS101, Mathematics, Physics"
                    value={course.name}
                    onChange={(e) => onChange(index, "name", e.target.value)}
                    className="course-input"
                    required
                />
            </div>

            <div className="sessions-container">
                <div className="session-header">
                    <h4>Course Sessions</h4>
                    <p className="session-note">Select at least one type of session</p>
                </div>

                {/* Lecture Section */}
                <div className="session-section">
                    <div className="session-toggle">
                        <label className="checkbox-label">
                            <input
                                type="checkbox"
                                checked={course.hasLecture}
                                onChange={toggleLecture}
                            />
                            <span className="checkbox-custom"></span>
                            <span className="session-type-label">Lecture</span>
                        </label>
                    </div>

                    {course.hasLecture && (
                        <div className="time-selector-container">
                            <div className="time-selector-row">
                                <div className="selector-group">
                                    <label>Day</label>
                                    <select
                                        value={course.lecture?.day || ''}
                                        onChange={(e) => handleLectureChange('day', e.target.value)}
                                        className="day-selector"
                                    >
                                        <option value="">Select Day</option>
                                        {days.map(day => (
                                            <option key={day.value} value={day.value}>
                                                {day.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="selector-group">
                                    <label>Start Time</label>
                                    <select
                                        value={course.lecture?.startTime || ''}
                                        onChange={(e) => handleLectureChange('startTime', e.target.value)}
                                        className="time-selector"
                                    >
                                        <option value="">Start</option>
                                        {hours.slice(0, -1).map(hour => (
                                            <option key={hour.value} value={hour.value}>
                                                {hour.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="selector-group">
                                    <label>End Time</label>
                                    <select
                                        value={course.lecture?.endTime || ''}
                                        onChange={(e) => handleLectureChange('endTime', e.target.value)}
                                        className="time-selector"
                                        disabled={!course.lecture?.startTime}
                                    >
                                        <option value="">End</option>
                                        {getAvailableEndTimes(course.lecture?.startTime).map(hour => (
                                            <option key={hour.value} value={hour.value}>
                                                {hour.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {errors[`lecture_${index}`] && (
                                <div className="error-message">
                                    {errors[`lecture_${index}`]}
                                </div>
                            )}

                            {course.lecture?.day && course.lecture?.startTime && course.lecture?.endTime && !errors[`lecture_${index}`] && (
                                <div className="time-preview">
                                    📚 Lecture: {course.lecture.day} {course.lecture.startTime}:00 - {course.lecture.endTime}:00
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Practice Section */}
                <div className="session-section">
                    <div className="session-toggle">
                        <label className="checkbox-label">
                            <input
                                type="checkbox"
                                checked={course.hasPractice}
                                onChange={togglePractice}
                            />
                            <span className="checkbox-custom"></span>
                            <span className="session-type-label">Practice/TA Session</span>
                        </label>
                    </div>

                    {course.hasPractice && (
                        <div className="time-selector-container">
                            <div className="time-selector-row">
                                <div className="selector-group">
                                    <label>Day</label>
                                    <select
                                        value={course.practice?.day || ''}
                                        onChange={(e) => handlePracticeChange('day', e.target.value)}
                                        className="day-selector"
                                    >
                                        <option value="">Select Day</option>
                                        {days.map(day => (
                                            <option key={day.value} value={day.value}>
                                                {day.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="selector-group">
                                    <label>Start Time</label>
                                    <select
                                        value={course.practice?.startTime || ''}
                                        onChange={(e) => handlePracticeChange('startTime', e.target.value)}
                                        className="time-selector"
                                    >
                                        <option value="">Start</option>
                                        {hours.slice(0, -1).map(hour => (
                                            <option key={hour.value} value={hour.value}>
                                                {hour.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="selector-group">
                                    <label>End Time</label>
                                    <select
                                        value={course.practice?.endTime || ''}
                                        onChange={(e) => handlePracticeChange('endTime', e.target.value)}
                                        className="time-selector"
                                        disabled={!course.practice?.startTime}
                                    >
                                        <option value="">End</option>
                                        {getAvailableEndTimes(course.practice?.startTime).map(hour => (
                                            <option key={hour.value} value={hour.value}>
                                                {hour.label}
                                            </option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            {errors[`practice_${index}`] && (
                                <div className="error-message">
                                    {errors[`practice_${index}`]}
                                </div>
                            )}

                            {course.practice?.day && course.practice?.startTime && course.practice?.endTime && !errors[`practice_${index}`] && (
                                <div className="time-preview">
                                    👨‍🏫 Practice: {course.practice.day} {course.practice.startTime}:00 - {course.practice.endTime}:00
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {!course.hasLecture && !course.hasPractice && (
                    <div className="validation-warning">
                        ⚠️ Please select at least one session type (Lecture or Practice)
                    </div>
                )}
            </div>
        </div>
    );
};

export default CourseInput;