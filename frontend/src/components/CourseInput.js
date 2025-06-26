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

    const validateTimeSlot = (day, startTime, endTime, type, slotIndex) => {
        const newErrors = { ...errors };
        const errorKey = `${type}_${index}_${slotIndex}`;

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

    const handleLectureChange = (slotIndex, field, value) => {
        const newLectures = [...(course.lectures || [])];
        if (!newLectures[slotIndex]) {
            newLectures[slotIndex] = { day: '', startTime: '', endTime: '' };
        }
        newLectures[slotIndex][field] = value;

        // Validate when all fields are filled
        const slot = newLectures[slotIndex];
        if (slot.day && slot.startTime !== '' && slot.endTime !== '') {
            validateTimeSlot(slot.day, slot.startTime, slot.endTime, 'lecture', slotIndex);
        }

        onChange(index, 'lectures', newLectures);
    };

    const handlePracticeChange = (slotIndex, field, value) => {
        const newPractices = [...(course.practices || [])];
        if (!newPractices[slotIndex]) {
            newPractices[slotIndex] = { day: '', startTime: '', endTime: '' };
        }
        newPractices[slotIndex][field] = value;

        // Validate when all fields are filled
        const slot = newPractices[slotIndex];
        if (slot.day && slot.startTime !== '' && slot.endTime !== '') {
            validateTimeSlot(slot.day, slot.startTime, slot.endTime, 'practice', slotIndex);
        }

        onChange(index, 'practices', newPractices);
    };

    const addLectureSlot = () => {
        const newLectures = [...(course.lectures || [])];
        newLectures.push({ day: '', startTime: '', endTime: '' });
        onChange(index, 'lectures', newLectures);
        onChange(index, 'hasLecture', true);
    };

    const addPracticeSlot = () => {
        const newPractices = [...(course.practices || [])];
        newPractices.push({ day: '', startTime: '', endTime: '' });
        onChange(index, 'practices', newPractices);
        onChange(index, 'hasPractice', true);
    };

    const removeLectureSlot = (slotIndex) => {
        const newLectures = course.lectures.filter((_, i) => i !== slotIndex);
        onChange(index, 'lectures', newLectures);
        
        // Clear errors for this slot
        const newErrors = { ...errors };
        delete newErrors[`lecture_${index}_${slotIndex}`];
        setErrors(newErrors);

        // If no lectures left, disable lecture section
        if (newLectures.length === 0) {
            onChange(index, 'hasLecture', false);
        }
    };

    const removePracticeSlot = (slotIndex) => {
        const newPractices = course.practices.filter((_, i) => i !== slotIndex);
        onChange(index, 'practices', newPractices);
        
        // Clear errors for this slot
        const newErrors = { ...errors };
        delete newErrors[`practice_${index}_${slotIndex}`];
        setErrors(newErrors);

        // If no practices left, disable practice section
        if (newPractices.length === 0) {
            onChange(index, 'hasPractice', false);
        }
    };

    const getAvailableEndTimes = (startTime) => {
        if (startTime === '' || startTime === null) return [];
        const start = parseInt(startTime);
        return hours.filter(hour => hour.value > start && hour.value <= start + 6);
    };

    const hasValidSession = () => {
        const lectureValid = course.hasLecture && 
            course.lectures && 
            course.lectures.length > 0 &&
            course.lectures.some(lecture => 
                lecture.day && 
                lecture.startTime !== '' && 
                lecture.endTime !== '' &&
                !errors[`lecture_${index}_${course.lectures.indexOf(lecture)}`]
            );
            
        const practiceValid = course.hasPractice && 
            course.practices && 
            course.practices.length > 0 &&
            course.practices.some(practice => 
                practice.day && 
                practice.startTime !== '' && 
                practice.endTime !== '' &&
                !errors[`practice_${index}_${course.practices.indexOf(practice)}`]
            );

        return lectureValid || practiceValid;
    };

    const renderTimeSlot = (slot, slotIndex, type, onSlotChange, onSlotRemove) => {
        const errorKey = `${type}_${index}_${slotIndex}`;
        const canRemoveSlot = type === 'lecture' ? 
            (course.lectures && course.lectures.length > 1) : 
            (course.practices && course.practices.length > 1);

        return (
            <div key={slotIndex} className="time-slot-item">
                <div className="time-slot-header">
                    <span className="time-slot-number">
                        {type === 'lecture' ? '📚' : '👨‍🏫'} Session {slotIndex + 1}
                    </span>
                    {canRemoveSlot && (
                        <button
                            type="button"
                            className="remove-slot-btn"
                            onClick={() => onSlotRemove(slotIndex)}
                            title="Remove this time slot"
                        >
                            ×
                        </button>
                    )}
                </div>

                <div className="time-selector-row">
                    <div className="selector-group">
                        <label>Day</label>
                        <select
                            value={slot.day || ''}
                            onChange={(e) => onSlotChange(slotIndex, 'day', e.target.value)}
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
                            value={slot.startTime || ''}
                            onChange={(e) => onSlotChange(slotIndex, 'startTime', e.target.value)}
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
                            value={slot.endTime || ''}
                            onChange={(e) => onSlotChange(slotIndex, 'endTime', e.target.value)}
                            className="time-selector"
                            disabled={!slot.startTime}
                        >
                            <option value="">End</option>
                            {getAvailableEndTimes(slot.startTime).map(hour => (
                                <option key={hour.value} value={hour.value}>
                                    {hour.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                {errors[errorKey] && (
                    <div className="error-message">
                        {errors[errorKey]}
                    </div>
                )}

                {slot.day && slot.startTime && slot.endTime && !errors[errorKey] && (
                    <div className="time-preview">
                        {type === 'lecture' ? '📚' : '👨‍🏫'} {slot.day} {slot.startTime}:00 - {slot.endTime}:00
                    </div>
                )}
            </div>
        );
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
                    <p className="session-note">Add at least one lecture or practice session</p>
                </div>

                {/* Lecture Section */}
                <div className="session-section">
                    <div className="session-type-header">
                        <h5 className="session-type-title">📚 Lectures</h5>
                        <button
                            type="button"
                            className="add-slot-btn"
                            onClick={addLectureSlot}
                            title="Add lecture time slot"
                        >
                            + Add Lecture
                        </button>
                    </div>

                    {course.lectures && course.lectures.length > 0 ? (
                        <div className="time-slots-container">
                            {course.lectures.map((lecture, slotIndex) => 
                                renderTimeSlot(
                                    lecture, 
                                    slotIndex, 
                                    'lecture', 
                                    handleLectureChange, 
                                    removeLectureSlot
                                )
                            )}
                        </div>
                    ) : (
                        <div className="no-sessions-message">
                            No lecture sessions added. Click "Add Lecture" to add one.
                        </div>
                    )}
                </div>

                {/* Practice Section */}
                <div className="session-section">
                    <div className="session-type-header">
                        <h5 className="session-type-title">👨‍🏫 Practice/TA Sessions</h5>
                        <button
                            type="button"
                            className="add-slot-btn"
                            onClick={addPracticeSlot}
                            title="Add practice time slot"
                        >
                            + Add Practice
                        </button>
                    </div>

                    {course.practices && course.practices.length > 0 ? (
                        <div className="time-slots-container">
                            {course.practices.map((practice, slotIndex) => 
                                renderTimeSlot(
                                    practice, 
                                    slotIndex, 
                                    'practice', 
                                    handlePracticeChange, 
                                    removePracticeSlot
                                )
                            )}
                        </div>
                    ) : (
                        <div className="no-sessions-message">
                            No practice sessions added. Click "Add Practice" to add one.
                        </div>
                    )}
                </div>

                {(!course.lectures || course.lectures.length === 0) && 
                 (!course.practices || course.practices.length === 0) && (
                    <div className="validation-warning">
                        ⚠️ Please add at least one lecture or practice session
                    </div>
                )}
            </div>
        </div>
    );
};

export default CourseInput;