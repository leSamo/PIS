package cz.xoleks00.pis.jwt;

import java.security.Principal;

import org.eclipse.microprofile.jwt.JsonWebToken;

import jakarta.annotation.security.RolesAllowed;
import jakarta.inject.Inject;
import jakarta.ws.rs.GET;
import jakarta.ws.rs.Path;


/**
 *
 * @author burgetr
 */
@Path("ping")
public class PingResource 
{
    @Inject
    private JsonWebToken token;
    
    @Inject
    private Principal principal;
    

    @GET
    public String ping() {
        return "Ping OK";
    }
    
    @GET
    @Path("protected")
    @RolesAllowed("admin")
    public String getProtected() {
        String login = (principal != null) ? principal.getName() : "unknown";
        return "Hello, " + login + " " + token.getGroups() + "! This is a protected resource.";
    }

}
