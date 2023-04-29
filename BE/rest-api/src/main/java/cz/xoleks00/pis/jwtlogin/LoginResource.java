package cz.xoleks00.pis.jwtlogin;

import org.mindrot.jbcrypt.BCrypt;

import cz.xoleks00.pis.data.Person;
import cz.xoleks00.pis.service.PersonManager;
import jakarta.inject.Inject;
import jakarta.ws.rs.Consumes;
import jakarta.ws.rs.POST;
import jakarta.ws.rs.Path;
import jakarta.ws.rs.Produces;
import jakarta.ws.rs.core.MediaType;
import jakarta.ws.rs.core.Response;
import jakarta.ws.rs.core.Response.Status;

@Path("login")
public class LoginResource {

    @Inject
    private PersonManager personManager;

    @POST
    @Consumes(MediaType.APPLICATION_JSON)
    @Produces(MediaType.APPLICATION_JSON)
    public Response login(Credentials credentials) {
        if (credentials != null) {
            Person person = personManager.findByUsername(credentials.getLogin());
            if (person != null && BCrypt.checkpw(credentials.getPassword(), person.getPassword())) {
                try {
                    String token = JwtTokenGenerator.generateJWTString("/jwt-token.json", person);
                    TokenResponse resp = new TokenResponse(token);
                    return Response.ok(resp).build();
                } catch (Exception e) {
                    return Response.status(Status.INTERNAL_SERVER_ERROR).entity(e).build();
                }
            } else {
                return Response.status(Status.FORBIDDEN).entity("Invalid login").build();
            }
        } else {
            return Response.status(Status.FORBIDDEN).entity("Invalid login").build();
        }
    }
}
