package com.sams.controller;

import com.sams.dto.response.CalendarEventResponse;
import com.sams.exception.GlobalExceptionHandler;
import com.sams.security.JwtAuthFilter;
import com.sams.security.JwtService;
import com.sams.service.CalendarService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.status;

@WebMvcTest(CalendarController.class)
@AutoConfigureMockMvc(addFilters = false)
@Import(GlobalExceptionHandler.class)
class CalendarControllerTest {

    @Autowired private MockMvc mockMvc;

    @MockBean private CalendarService calendarService;
    @MockBean private JwtAuthFilter jwtAuthFilter;
    @MockBean private JwtService jwtService;

    @Test
    void testGetEvents() throws Exception {
        UUID eventId = UUID.randomUUID();
        when(calendarService.getEvents()).thenReturn(List.of(
            new CalendarEventResponse(eventId, "Diwali Break", "HOLIDAY", LocalDate.of(2026, 11, 1), LocalDate.of(2026, 11, 3))
        ));

        mockMvc.perform(get("/api/calendar"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$[0].title").value("Diwali Break"))
            .andExpect(jsonPath("$[0].type").value("HOLIDAY"));
    }
}
