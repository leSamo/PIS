package cz.xoleks00.pis.data;

import java.util.Collection;
import cz.xoleks00.pis.data.Event;

public class PersonEventsDTO {
    private Collection<Event> events;

    public PersonEventsDTO(Collection<Event> events) {
        this.events = events;
    }

    public Collection<Event> getEvents() {
        return events;
    }

    public void setEvents(Collection<Event> events) {
        this.events = events;
    }
}