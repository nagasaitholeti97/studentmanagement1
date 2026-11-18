package com.sams.repository;

import com.sams.model.CalendarEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface CalendarRepository extends JpaRepository<CalendarEvent, UUID> {
    List<CalendarEvent> findAllByOrderByStartDateAsc();
}
