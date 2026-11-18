
package com.sams.mapper;

import com.sams.dto.response.*;
import com.sams.model.*;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.Objects;

@Component
public class EntityDtoMapper {

    public StudentProfileResponse toStudentProfile(Student s) {
        if (s == null) return null;

        return new StudentProfileResponse(
            s.getId(),
            s.getRollNo(),
            s.getFullName(),
            s.getUser() != null ? s.getUser().getEmail() : null,
            Objects.toString(s.getPersonalEmail(), ""),
            s.getPhone(),
            s.getGender(),
            s.getDateOfBirth(),
            s.getFatherName(),
            s.getMotherName(),
            s.getParentPhone(),
            s.getAddress(),
            s.getCity(),
            s.getState(),
            s.getPincode(),
            s.getDepartment(),
            s.getCourse(),
            s.getYearLabel(),
            s.getSemester(),
            s.getSection()
        );
    }

    public FacultyProfileResponse toFacultyProfile(
            Faculty f, List<String> subjects) {
        if (f == null) return null;

        return new FacultyProfileResponse(
            f.getId(),
            f.getFullName(),
            f.getDesignation(),
            f.getDepartment(),
            f.getUser() != null ? f.getUser().getEmail() : null,
            Objects.toString(f.getPersonalEmail(), ""),
            Objects.toString(f.getPhone(), ""),
            Objects.toString(f.getGender(), ""),
            Objects.requireNonNullElse(f.getAge(), 0),
            Objects.toString(f.getQualification(), ""),
            Objects.requireNonNullElse(f.getExperienceYears(), 0),
            subjects != null ? subjects : List.of()
        );
    }

    public ClassInfoResponse toClassInfo(
            CollegeClass c, String subjectName,
            int studentCount, int average, int below75) {
        if (c == null) return null;

        return new ClassInfoResponse(
            c.getCode(),
            c.getLabel(),
            Objects.requireNonNullElse(c.getYearNumber(), 0),
            Objects.toString(c.getSection(), ""),
            Objects.toString(subjectName, ""),
            studentCount,
            average,
            below75
        );
    }

    public ClassStudentResponse toClassStudent(Student s) {
        if (s == null) return null;

        return new ClassStudentResponse(
            s.getId(),
            s.getRollNo(),
            s.getFullName()
        );
    }

    public CalendarEventResponse toCalendarEvent(CalendarEvent e) {
        if (e == null) return null;

        return new CalendarEventResponse(
            e.getId(),
            e.getTitle(),
            e.getType(),
            e.getStartDate(),
            e.getEndDate()
        );
    }

    public ExamSlotResponse toExamSlot(ExamSlot e) {
        if (e == null) return null;

        return new ExamSlotResponse(
            e.getId(),
            e.getExamType(),
            e.getSubject(),
            e.getCode(),
            e.getExamDate()
        );
    }

    public SavedMarkResponse toSavedMark(AttendanceRecord a) {
        if (a == null) return null;

        return new SavedMarkResponse(
            a.getStudent().getId(),
            a.getStatus()
        );
    }
}
