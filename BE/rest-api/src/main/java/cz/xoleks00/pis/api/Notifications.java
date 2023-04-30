package cz.xoleks00.pis.api;



import java.util.List;

import cz.xoleks00.pis.data.Notification;
import cz.xoleks00.pis.service.NotificationManager;
import cz.xoleks00.pis.service.UserManager;
import jakarta.inject.Inject;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.PUT;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.core.Response.Status;

@Path("/notifications")
public class Notifications {

    @Inject
    private NotificationManager ntfMgr;

    @Inject
    private UserManager userMgr;



    @GET
    @Path("/{username}")
    @Produces(MediaType.APPLICATION_JSON)
    public Response getNotificationsByUsername(@PathParam("username") String username) {
        if (userMgr.findByUsername(username) == null) {
            return Response.status(Status.BAD_REQUEST)
                    .entity("User not found: " + username)
                    .type(MediaType.APPLICATION_JSON)
                    .build();
        }
        List<Notification> notifications = ntfMgr.findByUsername(username);
        return Response.ok(notifications).build();
    }

    @PUT
    @Path("{username}/ack")
    @Produces(MediaType.APPLICATION_JSON)
    public Response ackAllNotificationsByUsername(@PathParam("username") String username) {
        if (userMgr.findByUsername(username) == null) {
            return Response.status(Status.BAD_REQUEST)
                    .entity("User not found: " + username)
                    .type(MediaType.APPLICATION_JSON)
                    .build();
        }
        int updatedNotifications = ntfMgr.ackAllByUsername(username);
        return Response.ok(username + " has " + updatedNotifications + " acknowledged notifications").type(MediaType.APPLICATION_JSON).build();
    }
}
