package cz.xoleks00.pis.data;

import java.util.Collection;

public class UserEventsDTO {
    private Collection<Event> events;

    public UserEventsDTO(Collection<Event> events) {
        this.events = events;
    }

    public Collection<Event> getEvents() {
        return events;
    }

    public void setEvents(Collection<Event> events) {
        this.events = events;
    }
}