
import React from "react";
import { useState } from "react";
const chat = () => {
    const [AIresponse, setAIResponse] =useState("");

    const HandleSendQueary = async (e) => {
        e.preventDefault();
        const message = document.getElementById("message").value;

        try {
            const response = await fetch("/api/AI/getAISuggestion", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ question:message }),
            });

            const data = await response.json();
            setAIResponse(data)
            console.log(data);
        } catch (error) {
            console.log(error);
        }

    }

    return (
    <div>
        {/* Added margin-top and padding for better spacing */}
        <div className="container mx-auto mt-8 p-4 text-xl text-center">
            Welcome to the AI Chat Section 
        </div>
        {/* Added padding and a border for a clearer container */}
        <div className="container mx-auto p-4 border border-gray-300 rounded-lg shadow-md">
<form onSubmit={HandleSendQueary}>
<label for="message" class="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Your message</label>
        {/* Added ring and focus styles for better visual feedback */}
<textarea id="message" rows="4" class="block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500" placeholder="Write your thoughts here..."></textarea>
        {/* Styled the button for better appearance and usability */}
        {/* Added a type="submit" to the button within the form */}
<button type="submit" className="mt-4 px-6 py-2 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
          ASK
        </button>
</form>
        {/* Added padding and a background for the AI response section */}
        { AIresponse && <div className="container mt-4 p-4 bg-gray-100 rounded-lg">
           {AIresponse} 
        {/* Removed extra space before closing div */}
        </div> }
        </div>
    </div>
    )

}

export default chat;