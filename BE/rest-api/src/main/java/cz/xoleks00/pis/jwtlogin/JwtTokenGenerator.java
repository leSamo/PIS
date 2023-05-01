package cz.xoleks00.pis.jwtlogin;

import static com.nimbusds.jose.JOSEObjectType.JWT;
import static com.nimbusds.jose.JWSAlgorithm.RS256;

import java.security.KeyFactory;
import java.security.PrivateKey;
import java.security.spec.PKCS8EncodedKeySpec;
import java.util.Base64;
import java.util.Date;
import java.util.List;

import org.eclipse.microprofile.jwt.Claims;

import com.nimbusds.jose.JWSHeader;
import com.nimbusds.jose.crypto.RSASSASigner;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;

import cz.xoleks00.pis.data.PISUser;


/**
 * Partially based on the original implementation at
 * https://github.com/javaee-samples/microprofile1.4-samples 
 */
public class JwtTokenGenerator {

    public static String generateJWTString(String jsonResource, PISUser PISUser) throws Exception {

        long currentTimeMillis = System.currentTimeMillis();
        long expirationTimeMillis = currentTimeMillis + (24 * 60 * 60 * 1000);
        
    // Set the user role based on the isAdmin field
    String role = PISUser.isAdmin() ? "admin" : "employee";
    String position = PISUser.getUserRole().toString();


    // create the claim set
    JWTClaimsSet claimsSet = new JWTClaimsSet.Builder()
             .issuer("piscalendar")
             .issueTime(new Date(currentTimeMillis))
             .expirationTime(new Date(expirationTimeMillis))
             .subject(PISUser.getUsername())
             .claim(Claims.upn.name(), PISUser.getUsername())
             .claim(Claims.groups.name(), List.of(role))
             .claim(Claims.acr.name(), position)
             .build();
        // create the signed token
        SignedJWT signedJWT = new SignedJWT(new JWSHeader
                                            .Builder(RS256)
                                            .keyID("/private_key.pem")
                                            .type(JWT)
                                            .build(), claimsSet);
        
        signedJWT.sign(new RSASSASigner(readPrivateKey("/private_key.pem")));
        
        return signedJWT.serialize();
    }
    
    public static PrivateKey readPrivateKey(String resourceName) throws Exception {
        byte[] byteBuffer = new byte[16384];
        int length = Thread.currentThread().getContextClassLoader()
                                    .getResource(resourceName)
                                    .openStream()
                                    .read(byteBuffer);
        
        String key = new String(byteBuffer, 0, length).replaceAll("-----BEGIN (.*)-----", "")
                                                      .replaceAll("-----END (.*)----", "")
                                                      .replaceAll("\r\n", "")
                                                      .replaceAll("\n", "")
                                                      .trim();

        return KeyFactory.getInstance("RSA")
                         .generatePrivate(new PKCS8EncodedKeySpec(Base64.getDecoder().decode(key)));
    }

}
