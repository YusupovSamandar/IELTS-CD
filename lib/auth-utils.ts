"use client";

import { signOut as nextAuthSignOut } from "next-auth/react";

/**
 * Custom logout function that ensures proper cleanup of all session data
 */
export const logout = async (redirectTo: string = "/auth/login") => {
  try {
    // Clear any client-side storage
    if (typeof window !== 'undefined') {
      // Clear localStorage
      localStorage.clear();
      // Clear sessionStorage  
      sessionStorage.clear();
      
      // Clear any custom cookies if they exist
      document.cookie.split(";").forEach(function(c) { 
        document.cookie = c.replace(/^ +/, "").replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/"); 
      });
    }
    
    // Sign out using NextAuth
    await nextAuthSignOut({
      callbackUrl: redirectTo,
      redirect: true
    });
  } catch (error) {
    console.error("Logout error:", error);
    
    // Force redirect to login if signOut fails
    if (typeof window !== 'undefined') {
      window.location.href = redirectTo;
    }
  }
};

/**
 * Function to check if user is authenticated on client side
 */
export const isAuthenticated = () => {
  if (typeof window === 'undefined') return false;
  
  // Check for NextAuth session cookie
  const sessionCookie = document.cookie
    .split(';')
    .find(cookie => cookie.trim().startsWith('next-auth.session-token=') || cookie.trim().startsWith('__Secure-next-auth.session-token='));
    
  return !!sessionCookie;
};
