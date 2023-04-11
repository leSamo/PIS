package cz.xoleks00.pis.servlet;

import java.io.IOException;

import jakarta.servlet.ServletException;
import jakarta.servlet.annotation.WebServlet;
import jakarta.servlet.http.HttpServlet;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@WebServlet(urlPatterns="/hello")
public class HelloServlet extends HttpServlet {
    
	private static final long serialVersionUID = 1L;

    public HelloServlet() {
    }

	protected void doGet(HttpServletRequest request, HttpServletResponse response) 
	        throws ServletException, IOException {
	    
		response.setContentType("text/plain");
		response.getWriter().println("Hello, World!");
	    response.getWriter().append("Served at: ").append(request.getContextPath());
	}

	protected void doPost(HttpServletRequest request, HttpServletResponse response)
	        throws ServletException, IOException {
		
		doGet(request, response);
	}

}
