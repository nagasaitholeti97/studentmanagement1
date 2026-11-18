package com.sams.security;
import jakarta.servlet.*;import jakarta.servlet.http.*;import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;import org.springframework.security.core.authority.SimpleGrantedAuthority;import org.springframework.security.core.context.SecurityContextHolder;import org.springframework.stereotype.Component;import org.springframework.web.filter.OncePerRequestFilter;import java.io.IOException;import java.util.List;
@Component public class JwtAuthFilter extends OncePerRequestFilter{
 private final JwtService jwt;public JwtAuthFilter(JwtService j){jwt=j;}
 @Override protected void doFilterInternal(HttpServletRequest req,HttpServletResponse res,FilterChain chain)throws ServletException,IOException{
 String h=req.getHeader("Authorization");if(h!=null&&h.startsWith("Bearer ")&&jwt.valid(h.substring(7))){try{String t=h.substring(7);var a=new UsernamePasswordAuthenticationToken(jwt.userId(t).toString(),null,List.of(new SimpleGrantedAuthority("ROLE_"+jwt.role(t))));SecurityContextHolder.getContext().setAuthentication(a);}catch(Exception ignored){}}
 chain.doFilter(req,res);}
}