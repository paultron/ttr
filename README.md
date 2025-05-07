# TableGenAI

## Overview

TableGenAI is a web-based application designed for TTRPG (Tabletop Role-Playing Game) players, writers, and artists. It leverages the Gemini API to generate custom tables of items, characters, locations, or any other prompts that can be used for inspiration in games, writing, or art creation. Users can create accounts, save their generated tables, and access them later. The goal is to provide a simple and intuitive tool for users to quickly generate and manage creative content tailored to their needs.

**Live Application:** [https://tablegenproj.web.app](https://tablegenproj.web.app)

## Features

*   **User Authentication:** Secure sign-up and login functionality using Firebase Authentication, allowing users to have a personalized experience.
*   **Custom Table Generation:** Users can define a title and a descriptive prompt to generate unique tables using the Gemini API.
*   **Save & Load Tables:** Registered users can save their generated tables to Firestore and load them back at any time.
*   **Adjustable Parameters:**
    *   **Number of Rows:** Specify how many items the table should contain.
    *   **Item Description Length:** Control the verbosity of the generated descriptions (Short, Medium, Long, etc.).
    *   **Temperature (Creativity):** Adjust the randomness and creativity of the Gemini API's output.
*   **Dynamic Form:** The input form can be hidden after table generation for a cleaner view and easily shown again.
*   **Alternating Row Colors:** For improved readability of generated tables.
*   **CSV Export:** Download generated tables as CSV files.
*   **Responsive Design:** Built with Tailwind CSS for a consistent experience.
*   **Cloud Deployed:** Hosted on Firebase Hosting for easy access.

## Tech Stack

*   **Frontend:** React with TypeScript, Vite
*   **Styling:** Tailwind CSS
*   **Generative AI:** Google Gemini API (`@google/genai`)
*   **Backend-as-a-Service (BaaS):** Firebase
    *   **Authentication:** Firebase Authentication
    *   **Database:** Firestore
    *   **Hosting:** Firebase Hosting
*   **State Management:** React Context API (for Auth, as seen in `AuthContext.tsx`)

## Project Structure (Key Files)

```
/src
├── App.tsx             # Main application component, routing logic
├── main.tsx            # Entry point of the React application
├── TableDisplay.tsx    # Component for rendering the table
├── TableForm.tsx       # Component for the input form
├── firebase/
│   └── BaseConfig.ts   # Firebase app initialization and service exports
├── store/
│   └── AuthContext.tsx # React Context for managing authentication state
├── components/         # (Likely location for UI components like Login, Signup, Navbar)
│   └── ...
├── pages/              # (Likely location for page components like HomePage, DashboardPage)
│   └── ...
├── index.css           # Global styles and Tailwind CSS imports
└── ...                 # Other assets and components
public/
├── ...                 # Static assets
README.md               # This file
package.json            # Project dependencies and scripts
vite.config.ts        # Vite configuration
tsconfig.json         # TypeScript configuration
firebase.json         # Firebase CLI configuration (includes hosting details)
.firebaserc           # Firebase project configuration
```

## Setup and Installation (for Local Development)

While the application is deployed live at [https://tablegenproj.web.app](https://tablegenproj.web.app), you can also run it locally:

1.  **Prerequisites:**
    *   Node.js (version 18.x or later recommended)
    *   npm (usually comes with Node.js)
    *   A Google Gemini API Key.
    *   A Firebase project set up with Authentication and Firestore enabled.

2.  **Clone the Repository (if applicable):**
    ```bash
    git clone <repository-url>
    cd <project-directory>
    ```

3.  **Install Dependencies:**
    ```bash
    npm install
    ```

4.  **Set up Environment Variables:**
    Create a `.env` file in the root of your project directory. You'll need to add your Firebase project configuration and your Gemini API key:
    ```env
    VITE_GEMINI_API_KEY=YOUR_GEMINI_API_KEY_HERE

    VITE_FIREBASE_API_KEY=YOUR_FIREBASE_API_KEY
    VITE_FIREBASE_AUTH_DOMAIN=YOUR_FIREBASE_AUTH_DOMAIN
    VITE_FIREBASE_PROJECT_ID=YOUR_FIREBASE_PROJECT_ID
    VITE_FIREBASE_STORAGE_BUCKET=YOUR_FIREBASE_STORAGE_BUCKET
    VITE_FIREBASE_MESSAGING_SENDER_ID=YOUR_FIREBASE_MESSAGING_SENDER_ID
    VITE_FIREBASE_APP_ID=YOUR_FIREBASE_APP_ID
    ```
    *Note: The `VITE_` prefix is important for Vite projects to expose these variables to the client-side code.*

5.  **Run the Development Server:**
    ```bash
    npm run dev
    ```
    This will usually start the application on `http://localhost:5173`.

## Usage

1.  **Navigate to the Application:** Visit [https://tablegenproj.web.app](https://tablegenproj.web.app) or your local development URL.
2.  **Sign Up / Log In:** Create an account or log in if you already have one. This will allow you to save and load your tables.
3.  **Fill the Form (Table Generation Options):**
    *   **Table Title:** Enter a concise title for your table.
    *   **Description:** Provide a detailed description of what you want the table to contain.
    *   **Rows:** Select the number of rows (items).
    *   **Item Desc. Length:** Choose the desired length for the generated item descriptions.
    *   **Temp (Temperature):** Adjust the slider to control the creativity. A value around `0.7` to `1.2` is often a good starting point for creative tasks.
4.  **Generate Table:** Click the "Generate Table" button.
5.  **View Results:** The generated table will appear.
6.  **Interact with Table:**
    *   **Save Table:** If logged in, an option to save the current table will be available.
    *   **Load Table:** If logged in, you can access and load your previously saved tables.
    *   **Download CSV:** Click the "Download CSV" button to save the current table locally.
    *   **Generate New Table / Modify:** Click "Edit & Generate New Table" (or "Show Form to Generate Table") to show the form.
    *   **Hide Form Options:** If the form is visible and a table is displayed, click "Hide Form Options" to collapse it.
    *   **Reset Form:** Click the "Reset form" link within the form to clear input fields.

## Future Enhancements (Ideas)

*   Ability to re-roll individual rows in a table.(next)
*   Ability to generate images from individual rows in a table.(soon)
*   More advanced table customization options (e.g., specific column types, editing saved tables directly).
*   Sharing tables with other users.
*   Direct integration with TTRPG platforms.(far future)

## Contributing

(Details on how to contribute to the project, if open for contributions. This would include coding standards, pull request processes, etc.)

## License

(Specify the license for the project, e.g., MIT, Apache 2.0.)
