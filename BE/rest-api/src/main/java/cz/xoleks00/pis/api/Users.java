package cz.xoleks00.pis.api;

import java.net.URI;
import java.util.Date;
import java.util.List;
import java.util.Objects;
import java.util.Set;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

import org.eclipse.microprofile.jwt.JsonWebToken;


import jakarta.annotation.PostConstruct;
import jakarta.annotation.security.RolesAllowed;
import jakarta.inject.Inject;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.DELETE;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.PUT;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.PathParam;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.QueryParam;
import jakarta.ws.rs.core.Context;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.core.Response.Status;
import jakarta.ws.rs.core.SecurityContext;
import jakarta.ws.rs.core.UriBuilder;
import jakarta.ws.rs.core.UriInfo;
import cz.xoleks00.pis.data.AddManagedUsersRequest;
import cz.xoleks00.pis.data.ErrorDTO;
import cz.xoleks00.pis.data.Event;
import cz.xoleks00.pis.data.UserEventsDTO;
import cz.xoleks00.pis.data.PISUser;
import cz.xoleks00.pis.data.UserDTO;
import cz.xoleks00.pis.service.EventManager;
import cz.xoleks00.pis.service.UserManager;


/*
 * TEST URL:
 * http://localhost:8080/jsf-basic/rest/users/list
 */
@Path("/users")
public class Users
{
	@Inject
	private UserManager userMgr; 

    @Inject
    private EventManager eventMgr;


    @Context
    private UriInfo context;

    @Context
    private SecurityContext securityContext;


    private static final Pattern USERNAME_PATTERN = Pattern.compile("^[a-zA-Z0-9_]{4,20}$");
    private static final Pattern PASSWORD_PATTERN = Pattern.compile("^[a-zA-Z0-9!@#$%^&*()_+,-./:;<=>?@[\\\\]^_`{|}~]{8,128}$");
    private static final Pattern EMAIL_PATTERN = Pattern.compile("^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}$");

    /**
     * Default constructor. 
     */
    public Users() 
    {
    }

    @PostConstruct
    public void init()
    {
    }
    

    @GET
    @RolesAllowed({ "admin", "employee" })
    @Produces(MediaType.APPLICATION_JSON)
    public List<UserDTO> getUsers(@QueryParam("filter") String filter) {
        List<PISUser> users;
        if (filter != null && !filter.isEmpty()) {
            users = userMgr.findBySubstring(filter);
        } else {
            users = userMgr.findAll();
        }
    
        List<UserDTO> userDTOs = users.stream()
            .map(user -> new UserDTO(user.getUsername(), user.getName(), user.getEmail(), user.getUserCreated(), user.isAdmin(), user.getUserRole(), user.getId(), user.getManagedUsers()))
            .collect(Collectors.toList());
    
        return userDTOs;
    }

    
    @Path("/{username}")
    @GET
    @Produces(MediaType.APPLICATION_JSON)
    @RolesAllowed({ "admin", "employee" })
    public Response getUserSingle(@PathParam("username") String username) {
        PISUser p = userMgr.findByUsername(username);
        if (p != null) {
            return Response.ok(p).build();
        } else {
            return Response.status(Status.NOT_FOUND).entity(new ErrorDTO("User not found for username: " + username)).type(MediaType.APPLICATION_JSON).build();
        }
    }

    @PUT
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    @RolesAllowed({ "admin", "employee" })
    public Response updateUsers(List<PISUser> content) 
    {
    	return Response.status(Response.Status.NOT_IMPLEMENTED).entity(new ErrorDTO("Not implemented")).type(MediaType.APPLICATION_JSON).build();
    }
    
    /**
     * Updates a PISUser.
     * @param id
     * @param src
     * @return
     */
    @Path("/{id}")
    @PUT
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    @RolesAllowed({ "admin", "employee" })
    public Response updateUserSingle(@PathParam("id") Long id, PISUser src) 
    {
    	PISUser p = userMgr.find(id);
    	if (p != null)
    	{
    		p.setName(src.getName());
    		p.setUserCreated(src.getUserCreated());
    		return Response.ok(p).build();
    	}
    	else
    		return Response.status(Status.NOT_FOUND).entity(new ErrorDTO("not found")).type(MediaType.APPLICATION_JSON).build();
    }
    
    /**
     * Adds a new PISUser.
     * @param PISUser The PISUser to add.
     * @return
     */
    @POST
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    @RolesAllowed("admin")
    public Response addUser(PISUser PISUser) {
        if (!USERNAME_PATTERN.matcher(PISUser.getUsername()).matches()) {
            return Response.status(Status.BAD_REQUEST).entity(new ErrorDTO("Invalid username")).type(MediaType.APPLICATION_JSON).build();
        }
    
        if (!PASSWORD_PATTERN.matcher(PISUser.getPassword()).matches()) {
            return Response.status(Status.BAD_REQUEST).entity(new ErrorDTO("Invalid password")).type(MediaType.APPLICATION_JSON).build();
        }
    
        if (!EMAIL_PATTERN.matcher(PISUser.getEmail()).matches()) {
            return Response.status(Status.BAD_REQUEST).entity(new ErrorDTO("Invalid email")).type(MediaType.APPLICATION_JSON).build();
        }
    
        PISUser existingByUsername = userMgr.findByUsername(PISUser.getUsername());
        if (existingByUsername != null) {
            return Response.status(Status.BAD_REQUEST).entity(new ErrorDTO("Username is taken")).type(MediaType.APPLICATION_JSON).build();
        }
    
        PISUser existingByEmail = userMgr.findByEmail(PISUser.getEmail());
        if (existingByEmail != null) {
            return Response.status(Status.BAD_REQUEST).entity(new ErrorDTO("Email is taken")).type(MediaType.APPLICATION_JSON).build();
        }
    
        PISUser.setUserCreated(new Date()); // Set the current date as userCreated
        PISUser.setAdmin(false); // Set isAdmin to false by default
        PISUser savedUser = userMgr.save(PISUser);
        final URI uri = UriBuilder.fromPath("/users/{resourceServerId}").build(savedUser.getId());
        return Response.created(uri).build(); 
    }
    
    
    /**
     * Deletes a PISUser.
     * @param username
     * @return
     */
    @Path("/{username}")
    @DELETE
    @Produces(MediaType.APPLICATION_JSON)
    @RolesAllowed("admin")
    public Response deleteUser(@PathParam("username") String username) {
        PISUser p = userMgr.findByUsername(username);
    
        // Get the logged-in user's ID
        JsonWebToken token = (JsonWebToken) securityContext.getUserPrincipal();
        String loggedInUsername = token.getClaim("sub");
        PISUser o = userMgr.findByUsername(loggedInUsername);
    
        if (username.equals(o.getUsername())) {
            return Response.status(Status.BAD_REQUEST).entity(new ErrorDTO("User cannot delete themselves")).type(MediaType.APPLICATION_JSON).build();
        }
    
        if (p != null) {

            // Remove the events where the user is the creator
            List<Event> userEvents = eventMgr.findEventsByCreator(p);
            for (Event event : userEvents) {
                eventMgr.remove(event);
            }
    
            // Remove the user from all associated events
            List<Event> events = eventMgr.findEventsByAttendee(p);
            for (Event event : events) {
                event.getAttendees().removeIf(attendee -> attendee.getUsername().equals(username));
                eventMgr.update(event);
            }


            userMgr.remove(p);
            return Response.ok().build();
        } else {
            return Response.status(Status.NOT_FOUND).entity(new ErrorDTO("not found")).type(MediaType.APPLICATION_JSON).build();
        }
    }
    
    

    @Path("/{id}/events")
    @GET
    @Produces(MediaType.APPLICATION_JSON)
    @RolesAllowed({ "admin", "employee" })
    public Response getEventsForUser(@PathParam("id") Long id) {
        PISUser p = userMgr.find(id);
    
        if (p != null) {
            // Get the events where the user is a creator or an attendee
            List<Event> userEvents = eventMgr.findEventsByUserId(id);
            UserEventsDTO userEventsDTO = new UserEventsDTO(userEvents);
            return Response.ok(userEventsDTO).build();
        } else {
            return Response.status(Status.NOT_FOUND).entity(new ErrorDTO("not found")).type(MediaType.APPLICATION_JSON).build();
        }
    }

    /**
     * Get all users managed by a given user.
     * @param username Username of the user whose managed users to retrieve.
     * @return A list of users managed by the given user.
     */
    @GET
    @Path("/{username}/managed_users")
    @Produces(MediaType.APPLICATION_JSON)
    @RolesAllowed({"admin", "employee"})
    public Response getManagedUsers(@PathParam("username") String username) {
        PISUser user = userMgr.findByUsername(username);
        if (user == null) {
            return Response.status(Status.NOT_FOUND).entity(new ErrorDTO("User not found")).type(MediaType.APPLICATION_JSON).build();
        }
        Set<String> managedUsernames = user.getManagedUsers();
        List<UserDTO> managedUsers = managedUsernames.stream()
                .map(managedUsername -> {
                    PISUser managedUser = userMgr.findByUsername(managedUsername);
                    if (managedUser != null) {
                        return new UserDTO(managedUser.getUsername(), managedUser.getName(), managedUser.getEmail(),
                                managedUser.getUserCreated(), managedUser.isAdmin(), managedUser.getUserRole(), managedUser.getId(), managedUser.getManagedUsers());
                    }
                    return null;
                })
                .filter(Objects::nonNull)
                .collect(Collectors.toList());
        return Response.ok().entity(managedUsers).build();
    }
    


    /**
     * Add multiple managed users to a user.
     *
     * @param username         Username of the user to add managed users to.
     * @param managedUsernames Array of usernames of the users to be managed.
     * @return A response indicating success or failure.
     */
    @POST
    @Path("/{username}/managed_users")
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    @RolesAllowed({"admin"})
    public Response addManagedUsers(@PathParam("username") String username, AddManagedUsersRequest requestBody) {
        PISUser user = userMgr.findByUsername(username);
        if (user == null) {
            return Response.status(Status.NOT_FOUND).entity(new ErrorDTO("User not found")).type(MediaType.APPLICATION_JSON).build();
        }

        List<String> managedUsernames = requestBody.getUsernames();
        for (String managedUsername : managedUsernames) {
            PISUser managedUser = userMgr.findByUsername(managedUsername);
            if (managedUser == null) {
                return Response.status(Status.BAD_REQUEST).entity(new ErrorDTO("Managed user not found: " + managedUsername)).type(MediaType.APPLICATION_JSON).build();
            }
        }

        user.getManagedUsers().addAll(managedUsernames);
        userMgr.save(user);

        return Response.ok().build();
    }

    //{
    //"usernames": ["user1", "user2", "user3"]
    //}

}