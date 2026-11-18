package com.sams.service;

import com.sams.dto.response.CalendarEventResponse;
import com.sams.mapper.EntityDtoMapper;
import com.sams.repository.CalendarRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@Transactional(readOnly = true)
public class CalendarService {

    private final CalendarRepository calendarRepository;
    private final EntityDtoMapper mapper;
    private final CurrentUserService currentUserService;

    public CalendarService(CalendarRepository calendarRepository, EntityDtoMapper mapper, CurrentUserService currentUserService) {
        this.calendarRepository = calendarRepository;
        this.mapper = mapper;
        this.currentUserService = currentUserService;
    }

    public List<CalendarEventResponse> getEvents() {
        currentUserService.getCurrentUser(); // Authenticated user check
        return calendarRepository.findAllByOrderByStartDateAsc().stream()
            .map(mapper::toCalendarEvent)
            .toList();
    }
}
