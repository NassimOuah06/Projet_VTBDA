'use client';

import { AuthForm } from "../components/AuthForm";

const Index = () => {
  // const router = useRouter(); // Initialize the router

  // // Authentication handler
  // const handleAuth = async (email: string, password: string) => {
  //   console.log("Authenticating:", email, password);

  //   try {
  //     // Make an API call to authenticate the user
  //     const response = await fetch('/api/auth', {
  //       method: 'POST',
  //       headers: {
  //         'Content-Type': 'application/json',
  //       },
  //       body: JSON.stringify({ email, password }),
  //     });

  //     // Check if the response is successful
  //     if (!response.ok) {
  //       throw new Error('Authentication failed');
  //     }

  //     // Parse the response JSON
  //     const data = await response.json();

  //     // Extract the username from the email
  //     const username = email.split('@')[0];

  //     // Navigate to another page (e.g., /information) and pass the username as a query parameter
  //     router.push(`/information?username=${username}`);
  //     console.log("Authenticated successfully with username ", username);
  //   } catch (error) {
  //     console.error('Authentication error:', error);
  //     // Handle authentication error (e.g., show an error message to the user)
  //   }
  // };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-white to-gray-500">
      <div className="w-full max-w-md"> 
        <AuthForm />
      </div>
    </div>
  );}

export default Index;