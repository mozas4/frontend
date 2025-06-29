import React, { useState, useCallback, useEffect } from "react";
import { useLocation } from 'react-router-dom';
import CourseInput from '../components/CourseInput';
import WeeklyScheduler from '../components/WeeklyScheduler';
import ConstraintsDisplay from '../components/ConstraintsDisplay';
import '../styles/SchedulerPage.css';

// פונקציה להמרה פשוטה - מחוץ לקומפוננטה
const convertScheduleToCourses = (scheduleData) => {
  console.log('🔍 Raw schedule data:', scheduleData);
  
  if (!Array.isArray(scheduleData)) {
    console.warn('Invalid schedule data format:', scheduleData);
    return [{ 
      name: "", 
      hasLecture: false,
      hasPractice: false,
      lectures: [],
      practices: []
    }];
  }

  const converted = scheduleData.map((courseData, index) => {
    console.log(`🔄 Converting course ${index}:`, courseData);
    
    const course = {
      name: courseData.name || "",
      hasLecture: false,
      hasPractice: false,
      lectures: [],
      practices: []
    };

    // המר הרצאה
    if (courseData.lecture) {
      console.log('  📚 Processing lecture:', courseData.lecture);
      // פשוט נבדוק אם זה בפורמט "Mon 9-11"
      const parts = courseData.lecture.split(' ');
      if (parts.length === 2) {
        const day = parts[0]; // Mon
        const timeRange = parts[1]; // 9-11
        const [start, end] = timeRange.split('-');
        
        course.hasLecture = true;
        course.lectures = [{
          day: day,
          startTime: start,
          endTime: end
        }];
        console.log('  ✅ Converted lecture to:', course.lectures[0]);
      }
    }

    // המר תרגול
    if (courseData.ta) {
      console.log('  👨‍🏫 Processing TA:', courseData.ta);
      const parts = courseData.ta.split(' ');
      if (parts.length === 2) {
        const day = parts[0]; // Tue
        const timeRange = parts[1]; // 14-16
        const [start, end] = timeRange.split('-');
        
        course.hasPractice = true;
        course.practices = [{
          day: day,
          startTime: start,
          endTime: end
        }];
        console.log('  ✅ Converted practice to:', course.practices[0]);
      }
    }

    console.log(`✅ Final converted course ${index}:`, course);
    return course;
  });

  console.log('🎯 All converted courses:', converted);
  return converted;
};

const SchedulerPage = ({ user, authToken }) => {
  const location = useLocation();
  
  const [preference, setPreference] = useState("crammed");
  const [courses, setCourses] = useState([
    { 
      name: "", 
      hasLecture: false,
      hasPractice: false,
      lectures: [],
      practices: []
    },
    { 
      name: "", 
      hasLecture: false,
      hasPractice: false,
      lectures: [],
      practices: []
    },
  ]);
  const [constraints, setConstraints] = useState("");
  const [error, setError] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [schedule, setSchedule] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [parsedConstraints, setParsedConstraints] = useState(null);
  const [constraintsUpdateFunction, setConstraintsUpdateFunction] = useState(null);
  
  const [loadedScheduleName, setLoadedScheduleName] = useState(null);
  const [loadedScheduleId, setLoadedScheduleId] = useState(null);
  
  const API_BASE_URL = process.env.REACT_APP_API_BASE_URL;

  useEffect(() => {
    if (location.state?.loadedSchedule) {
      console.log('🔍 Loading schedule from Dashboard:', location.state);
      console.log('📋 Schedule data:', location.state.loadedSchedule);
      console.log('📝 Schedule name:', location.state.scheduleName);
      console.log('🆔 Schedule ID:', location.state.scheduleId);
      
      setSchedule(location.state.loadedSchedule);
      setLoadedScheduleName(location.state.scheduleName);
      setLoadedScheduleId(location.state.scheduleId);
      setError(null);
      
      console.log('🔄 Converting schedule to courses format...');
      const loadedCourses = convertScheduleToCourses(location.state.loadedSchedule);
      console.log('✅ Converted courses:', loadedCourses);
      setCourses(loadedCourses);
      
      window.history.replaceState({}, document.title);
    }
  }, [location.state]);

  const handleCourseChange = (index, field, value) => {
    const newCourses = [...courses];
    newCourses[index][field] = value;
    
    // Update hasLecture and hasPractice flags based on array contents
    if (field === 'lectures') {
      newCourses[index].hasLecture = value.length > 0;
    }
    if (field === 'practices') {
      newCourses[index].hasPractice = value.length > 0;
    }
    
    
    // Update hasLecture and hasPractice flags based on array contents
    if (field === 'lectures') {
      newCourses[index].hasLecture = value.length > 0;
    }
    if (field === 'practices') {
      newCourses[index].hasPractice = value.length > 0;
    }
    
    setCourses(newCourses);
  };

  const addCourse = () => {
    setCourses([...courses, { 
      name: "", 
      hasLecture: false,
      hasPractice: false,
      lectures: [],
      practices: []
    }]);
    setCourses([...courses, { 
      name: "", 
      hasLecture: false,
      hasPractice: false,
      lectures: [],
      practices: []
    }]);
  };

  const removeCourse = (index) => {
    if (courses.length > 1) {
      setCourses(courses.filter((_, i) => i !== index));
    }
  };

  // הוסף פונקציה לניקוי המערכת הנטענת
  const clearLoadedSchedule = () => {
    setLoadedScheduleName(null);
    setLoadedScheduleId(null);
    setSchedule(null);
    setCourses([{ 
      name: "", 
      hasLecture: false,
      hasPractice: false,
      lectures: [],
      practices: []
    }]);
    setConstraints("");
    setError(null);
  };

  const validateForm = useCallback(() => {
    for (let i = 0; i < courses.length; i++) {
      const course = courses[i];
      
    for (let i = 0; i < courses.length; i++) {
      const course = courses[i];
      
      if (!course.name.trim()) {
        throw new Error(`Please fill in the name for course ${i + 1}`);
      }

      // Check if at least one session type has valid time slots
      const hasValidLectures = course.lectures && course.lectures.length > 0 && 
        course.lectures.some(lecture => 
          lecture.day && lecture.startTime !== '' && lecture.endTime !== ''
        );
      
      const hasValidPractices = course.practices && course.practices.length > 0 && 
        course.practices.some(practice => 
          practice.day && practice.startTime !== '' && practice.endTime !== ''
        );

      if (!hasValidLectures && !hasValidPractices) {
        throw new Error(`Course "${course.name}" must have at least one complete lecture or practice session`);
        throw new Error(`Please fill in the name for course ${i + 1}`);
      }

      // Check if at least one session type has valid time slots
      const hasValidLectures = course.lectures && course.lectures.length > 0 && 
        course.lectures.some(lecture => 
          lecture.day && lecture.startTime !== '' && lecture.endTime !== ''
        );
      
      const hasValidPractices = course.practices && course.practices.length > 0 && 
        course.practices.some(practice => 
          practice.day && practice.startTime !== '' && practice.endTime !== ''
        );

      if (!hasValidLectures && !hasValidPractices) {
        throw new Error(`Course "${course.name}" must have at least one complete lecture or practice session`);
      }

      // Validate all lecture time slots
      if (course.lectures && course.lectures.length > 0) {
        for (let j = 0; j < course.lectures.length; j++) {
          const lecture = course.lectures[j];
          if (lecture.day || lecture.startTime !== '' || lecture.endTime !== '') {
            // If any field is filled, all must be filled
            if (!lecture.day || lecture.startTime === '' || lecture.endTime === '') {
              throw new Error(`Please complete all details for lecture ${j + 1} in "${course.name}"`);
            }
            
            const lectureStart = parseInt(lecture.startTime);
            const lectureEnd = parseInt(lecture.endTime);
            
            if (lectureEnd <= lectureStart) {
              throw new Error(`Lecture ${j + 1} end time must be after start time for "${course.name}"`);
            }
          }
        }
      }

      // Validate all practice time slots
      if (course.practices && course.practices.length > 0) {
        for (let j = 0; j < course.practices.length; j++) {
          const practice = course.practices[j];
          if (practice.day || practice.startTime !== '' || practice.endTime !== '') {
            // If any field is filled, all must be filled
            if (!practice.day || practice.startTime === '' || practice.endTime === '') {
              throw new Error(`Please complete all details for practice session ${j + 1} in "${course.name}"`);
            }
            
            const practiceStart = parseInt(practice.startTime);
            const practiceEnd = parseInt(practice.endTime);
            
            if (practiceEnd <= practiceStart) {
              throw new Error(`Practice session ${j + 1} end time must be after start time for "${course.name}"`);
            }
          }
        }

      // Validate all lecture time slots
      if (course.lectures && course.lectures.length > 0) {
        for (let j = 0; j < course.lectures.length; j++) {
          const lecture = course.lectures[j];
          if (lecture.day || lecture.startTime !== '' || lecture.endTime !== '') {
            // If any field is filled, all must be filled
            if (!lecture.day || lecture.startTime === '' || lecture.endTime === '') {
              throw new Error(`Please complete all details for lecture ${j + 1} in "${course.name}"`);
            }
            
            const lectureStart = parseInt(lecture.startTime);
            const lectureEnd = parseInt(lecture.endTime);
            
            if (lectureEnd <= lectureStart) {
              throw new Error(`Lecture ${j + 1} end time must be after start time for "${course.name}"`);
            }
          }
        }
      }

      // Validate all practice time slots
      if (course.practices && course.practices.length > 0) {
        for (let j = 0; j < course.practices.length; j++) {
          const practice = course.practices[j];
          if (practice.day || practice.startTime !== '' || practice.endTime !== '') {
            // If any field is filled, all must be filled
            if (!practice.day || practice.startTime === '' || practice.endTime === '') {
              throw new Error(`Please complete all details for practice session ${j + 1} in "${course.name}"`);
            }
            
            const practiceStart = parseInt(practice.startTime);
            const practiceEnd = parseInt(practice.endTime);
            
            if (practiceEnd <= practiceStart) {
              throw new Error(`Practice session ${j + 1} end time must be after start time for "${course.name}"`);
            }
          }
        }
      }
    }
  }, [courses]);

  const formatCourseForAPI = useCallback((course) => {
    const formattedCourse = {
      name: course.name.trim(),
      lectures: [],
      ta_times: []
    };

    // Add all valid lecture time slots
    if (course.lectures && course.lectures.length > 0) {
      course.lectures.forEach(lecture => {
        if (lecture.day && lecture.startTime !== '' && lecture.endTime !== '') {
          formattedCourse.lectures.push(`${lecture.day} ${lecture.startTime}-${lecture.endTime}`);
        }
      });
    }

    // Add all valid practice time slots
    if (course.practices && course.practices.length > 0) {
      course.practices.forEach(practice => {
        if (practice.day && practice.startTime !== '' && practice.endTime !== '') {
          formattedCourse.ta_times.push(`${practice.day} ${practice.startTime}-${practice.endTime}`);
        }
      });
    }

    return formattedCourse;
  }, []);

  const generateScheduleWithConstraints = useCallback(async (constraintsToUse) => {
    try {
      validateForm();

      const formattedCourses = courses.map(formatCourseForAPI);
  const formatCourseForAPI = useCallback((course) => {
    const formattedCourse = {
      name: course.name.trim(),
      lectures: [],
      ta_times: []
    };

    // Add all valid lecture time slots
    if (course.lectures && course.lectures.length > 0) {
      course.lectures.forEach(lecture => {
        if (lecture.day && lecture.startTime !== '' && lecture.endTime !== '') {
          formattedCourse.lectures.push(`${lecture.day} ${lecture.startTime}-${lecture.endTime}`);
        }
      });
    }

    // Add all valid practice time slots
    if (course.practices && course.practices.length > 0) {
      course.practices.forEach(practice => {
        if (practice.day && practice.startTime !== '' && practice.endTime !== '') {
          formattedCourse.ta_times.push(`${practice.day} ${practice.startTime}-${practice.endTime}`);
        }
      });
    }

    return formattedCourse;
  }, []);

  const generateScheduleWithConstraints = useCallback(async (constraintsToUse) => {
    try {
      validateForm();

      const formattedCourses = courses.map(formatCourseForAPI);

      localStorage.setItem('originalCourseOptions', JSON.stringify(formattedCourses));
      localStorage.setItem('originalCourseOptions', JSON.stringify(formattedCourses));

      const headers = {
        "Content-Type": "application/json"
      };
      const headers = {
        "Content-Type": "application/json"
      };

      // Add authorization header if user is authenticated
      if (user && authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }

      console.log('🔄 Sending request to:', API_BASE_URL + "/api/schedule");
      console.log('📋 Request payload:', {
        preference,
        courses: formattedCourses,
        constraints: constraintsToUse
      });
      // Add authorization header if user is authenticated
      if (user && authToken) {
        headers['Authorization'] = `Bearer ${authToken}`;
      }

      console.log('🔄 Sending request to:', API_BASE_URL + "/api/schedule");
      console.log('📋 Request payload:', {
        preference,
        courses: formattedCourses,
        constraints: constraintsToUse
      });

      const scheduleRes = await fetch(API_BASE_URL + "/api/schedule", {
        method: "POST",
        headers: headers,
        body: JSON.stringify({
          preference,
          courses: formattedCourses,
          constraints: constraintsToUse
        }),
      });

      console.log('📡 Response status:', scheduleRes.status);
      console.log('📡 Response headers:', scheduleRes.headers);

      // Check if response is actually JSON
      const contentType = scheduleRes.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const responseText = await scheduleRes.text();
        console.error('❌ Non-JSON response received:', responseText);
        throw new Error(`Server returned non-JSON response. Status: ${scheduleRes.status}. This usually means the backend server is not running or the API endpoint is incorrect.`);
      }
      const scheduleRes = await fetch(API_BASE_URL + "/api/schedule", {
        method: "POST",
        headers: headers,
        body: JSON.stringify({
          preference,
          courses: formattedCourses,
          constraints: constraintsToUse
        }),
      });

      console.log('📡 Response status:', scheduleRes.status);
      console.log('📡 Response headers:', scheduleRes.headers);

      // Check if response is actually JSON
      const contentType = scheduleRes.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        const responseText = await scheduleRes.text();
        console.error('❌ Non-JSON response received:', responseText);
        throw new Error(`Server returned non-JSON response. Status: ${scheduleRes.status}. This usually means the backend server is not running or the API endpoint is incorrect.`);
      }

      if (!scheduleRes.ok) {
        const errorData = await scheduleRes.json();
        console.error('❌ API Error:', errorData);
        throw new Error(errorData.error || `Server error: ${scheduleRes.status}`);
      }
      if (!scheduleRes.ok) {
        const errorData = await scheduleRes.json();
        console.error('❌ API Error:', errorData);
        throw new Error(errorData.error || `Server error: ${scheduleRes.status}`);
      }

      const data = await scheduleRes.json();
      console.log('✅ Schedule response:', data);
      
      if (data.schedule) {
        setSchedule(data.schedule);
        setError(null);
      } else {
        const errorMessage = data.error || 'No valid schedule found with the given constraints. Try adjusting your requirements.';
        setError(errorMessage);
      }
    } catch (err) {
      console.error('❌ Schedule generation error:', err);
      let errorMessage = err.message;
      
      // Provide more helpful error messages
      if (err.message.includes('Failed to fetch')) {
        errorMessage = 'Unable to connect to the server. Please check if the backend is running and try again.';
      } else if (err.message.includes('NetworkError')) {
        errorMessage = 'Network error. Please check your internet connection and try again.';
      }
      
      setError(errorMessage);
    }
  }, [courses, preference, validateForm, user, authToken, API_BASE_URL, formatCourseForAPI]);
      const data = await scheduleRes.json();
      console.log('✅ Schedule response:', data);
      
      if (data.schedule) {
        setSchedule(data.schedule);
        setError(null);
      } else {
        const errorMessage = data.error || 'No valid schedule found with the given constraints. Try adjusting your requirements.';
        setError(errorMessage);
      }
    } catch (err) {
      console.error('❌ Schedule generation error:', err);
      let errorMessage = err.message;
      
      // Provide more helpful error messages
      if (err.message.includes('Failed to fetch')) {
        errorMessage = 'Unable to connect to the server. Please check if the backend is running and try again.';
      } else if (err.message.includes('NetworkError')) {
        errorMessage = 'Network error. Please check your internet connection and try again.';
      }
      
      setError(errorMessage);
    }
  }, [courses, preference, validateForm, user, authToken, API_BASE_URL, formatCourseForAPI]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    setIsLoading(true);
    setParsedConstraints(null);

    try {
      let parsedConstraints = [];
      let constraintsData = null;
      
      
      if (constraints.trim()) {
        const headers = {
          "Content-Type": "application/json"
        };

        // Add authorization header if user is authenticated
        if (user && authToken) {
          headers['Authorization'] = `Bearer ${authToken}`;
        }

        console.log('🔄 Parsing constraints...');
        

        console.log('🔄 Parsing constraints...');
        
        const parseRes = await fetch(API_BASE_URL + "/api/parse", {
          method: "POST",
          headers: headers,
          body: JSON.stringify({ text: constraints }),
        });

        console.log('📡 Parse response status:', parseRes.status);

        // Check if response is actually JSON
        const contentType = parseRes.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          const responseText = await parseRes.text();
          console.error('❌ Non-JSON response from parse endpoint:', responseText);
          throw new Error(`Constraints parsing failed. Server returned non-JSON response. This usually means the backend server is not running.`);
        }

        console.log('📡 Parse response status:', parseRes.status);

        // Check if response is actually JSON
        const contentType = parseRes.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          const responseText = await parseRes.text();
          console.error('❌ Non-JSON response from parse endpoint:', responseText);
          throw new Error(`Constraints parsing failed. Server returned non-JSON response. This usually means the backend server is not running.`);
        }

        if (!parseRes.ok) {
          const errorData = await parseRes.json();
          console.error('❌ Parse error:', errorData);
          console.error('❌ Parse error:', errorData);
          throw new Error(errorData.error || 'Failed to parse constraints');
        }

        constraintsData = await parseRes.json();
        parsedConstraints = constraintsData[0]?.constraints || [];
        setParsedConstraints(parsedConstraints);
        console.log('✅ Constraints parsed:', parsedConstraints);
      }

      await generateScheduleWithConstraints(parsedConstraints);
    } catch (err) {
      console.error('❌ Submit error:', err);
      let errorMessage = err.message;
      
      // Provide more helpful error messages
      if (err.message.includes('Failed to fetch')) {
        errorMessage = 'Unable to connect to the server. Please make sure the backend is running on the correct port and try again.';
      }
      
      console.error('❌ Submit error:', err);
      let errorMessage = err.message;
      
      // Provide more helpful error messages
      if (err.message.includes('Failed to fetch')) {
        errorMessage = 'Unable to connect to the server. Please make sure the backend is running on the correct port and try again.';
      }
      
      setError(errorMessage);
      setParsedConstraints(null);
    } finally {
      setIsSubmitting(false);
      setIsLoading(false);
    }
  };

  const handleConstraintsUpdate = useCallback(async (updatedConstraints) => {
    if (constraintsUpdateFunction) {
      setIsLoading(true);
      try {
        await constraintsUpdateFunction(updatedConstraints);
      } catch (err) {
        console.error('Error updating constraints:', err);
      } finally {
        setIsLoading(false);
      }
    }
  }, [constraintsUpdateFunction]);

  React.useEffect(() => {
    setConstraintsUpdateFunction(() => generateScheduleWithConstraints);
  }, [generateScheduleWithConstraints]);

  return (
    <div className="scheduler-page">
      <div className="scheduler-content">
        <div className="left-panel">
          <div className="course-scheduler">
            <div className="scheduler-header-section">
              <h2>Course Scheduler</h2>
              {loadedScheduleName && (
                <div className="loaded-schedule-info">
                  <span className="loaded-schedule-label">📂 Loaded Schedule:</span>
                  <strong>{loadedScheduleName}</strong>
                  <div className="loaded-schedule-actions">
                    <button 
                      type="button" 
                      className="clear-loaded-button"
                      onClick={clearLoadedSchedule}
                    >
                      ✖ Clear & Start New
                    </button>
                  </div>
                </div>
              )}
              {user && (
                <div className="user-welcome">
                  Welcome back, <strong>{user.first_name}</strong>!
                </div>
              )}
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="schedule-preference">
                <label htmlFor="preference">Schedule Preference</label>
                <select
                  id="preference"
                  value={preference}
                  onChange={(e) => setPreference(e.target.value)}
                >
                  <option value="crammed">Crammed (fewer days, back-to-back classes)</option>
                  <option value="spaced">Spaced Out (more days, fewer gaps)</option>
                </select>
              </div>

              {courses.map((course, i) => (
                <CourseInput
                  key={i}
                  course={course}
                  onChange={handleCourseChange}
                  onRemove={removeCourse}
                  index={i}
                  canRemove={courses.length > 1}
                />
              ))}

              <div className="constraints-section">
                <label htmlFor="constraints">Additional Constraints</label>
                <textarea
                  id="constraints"
                  className="constraints-input"
                  value={constraints}
                  onChange={(e) => setConstraints(e.target.value)}
                  placeholder="Enter your scheduling preferences in natural language:

• No classes before 9am
• No classes on Tuesday  
• Avoid TA Smith
• No classes after 5pm
• Prefer morning sessions"
                  rows={6}
                />
              </div>

              <div className="button-group">
                <button 
                  type="button" 
                  onClick={addCourse} 
                  className="add-button"
                  disabled={isSubmitting}
                >
                  + Add Another Course
                </button>
                <button 
                  type="submit" 
                  className="submit-button"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <div className="loading-spinner"></div>
                      {loadedScheduleName ? 'Updating Schedule...' : 'Generating Schedule...'}
                    </>
                  ) : (
                    loadedScheduleName ? 'Update Schedule' : 'Generate Schedule'
                  )}
                </button>
              </div>
            </form>

            {error && (
              <div className="error-message">
                {error}
              </div>
            )}
          </div>
        </div>

        <div className="right-panel">
          <ConstraintsDisplay 
            parsedConstraints={parsedConstraints} 
            onConstraintsUpdate={handleConstraintsUpdate}
            isRegenerating={isLoading}
          />
          <WeeklyScheduler 
            user={user} 
            authToken={authToken} 
            schedule={schedule} 
            isLoading={isLoading}
            scheduleName={loadedScheduleName}
            scheduleId={loadedScheduleId}
          />
        </div>
      </div>
    </div>
  );
};

export default SchedulerPage;