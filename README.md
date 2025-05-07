# TableGenAI

## Overview

TableGenAI is a web-based application designed for TTRPG (Tabletop Role-Playing Game) players, writers, and artists. It leverages the Gemini API to generate custom tables of items, characters, locations, or any other prompts that can be used for inspiration in games, writing, or art creation. The goal is to provide a simple and intuitive tool for users to quickly generate creative content tailored to their needs.

## Features

*   **Custom Table Generation:** Users can define a title and a descriptive prompt to generate unique tables.
*   **Adjustable Parameters:**
    *   **Number of Rows:** Specify how many items the table should contain.
    *   **Item Description Length:** Control the verbosity of the generated descriptions (Short, Medium, Long, etc.).
    *   **Temperature (Creativity):** Adjust the randomness and creativity of the Gemini API's output. Higher values lead to more unexpected results, while lower values produce more predictable content.
*   **CSV Export:** Download your generated tables as CSV files for easy use in other applications or for offline access.
*   **Responsive Design:** Built with Tailwind CSS for a consistent experience across different devices.

## Tech Stack

*   **Frontend:** React with TypeScript, Vite
*   **Styling:** Tailwind CSS
*   **Generative AI:** Google Gemini API (`@google/genai`)
*   **Deployment (Planned/Example):** Firebase Hosting or Google Cloud

## Project Structure (Key Files)

```
/src
├── App.tsx             # Main application component, state management
├── main.tsx            # Entry point of the React application
├── TableDisplay.tsx    # Component for rendering the table
├── TableForm.tsx       # Component for the input form
├── index.css           # Global styles and Tailwind CSS imports
└── ...                 # Other assets and components
public/
├── ...                 # Static assets
README.md               # This file
package.json            # Project dependencies and scripts
 vite.config.ts        # Vite configuration
 tsconfig.json         # TypeScript configuration
 firebase.json         # Firebase configuration (if used)
```

## Setup and Installation

To run TableGenAI locally, follow these steps:

1.  **Prerequisites:**
    *   Node.js (version 18.x or later recommended)
    *   npm (usually comes with Node.js)
    *   A Google Gemini API Key.

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
    Create a `.env` file in the root of your project directory and add your Gemini API key:
    ```env
    VITE_GEMINI_API_KEY=YOUR_API_KEY_HERE
    ```
    *Note: The `VITE_` prefix is important for Vite projects to expose the variable to the client-side code.*

5.  **Run the Development Server:**
    ```bash
    npm run dev
    ```
    This will usually start the application on `http://localhost:5173` (or another port if 5173 is busy).

## Usage

1.  **Open the Application:** Navigate to the local development URL in your browser.
2.  **Fill the Form:**
    *   **Table Title:** Enter a concise title for your table (e.g., "Mystic Forest Encounters", "Cyberpunk Weapon Mods").
    *   **Description:** Provide a detailed description of what you want the table to contain. Be specific for better results. For example: "A list of strange and magical items one might find in an ancient, enchanted library. Descriptions should be mysterious."
    *   **Rows:** Select the number of rows (items) you want in your table.
    *   **Item Desc. Length:** Choose the desired length for the generated item descriptions.
    *   **Temp (Temperature):** Adjust the slider to control the creativity. A value around `0.7` to `1.2` is often a good starting point for creative tasks.
3.  **Generate Table:** Click the "Generate Table" button.
4.  **View Results:** The generated table will appear below the form. The form will automatically hide.
5.  **Interact with Table:**
    *   **Download CSV:** Click the "Download CSV" button below the table to save it.
    *   **Generate New Table / Modify:** Click "Edit & Generate New Table" (or "Show Form to Generate Table" if no table is present) to show the form again. You can then modify your inputs and generate a new table.
    *   **Hide Form Options:** If the form is visible and a table is displayed, you can click "Hide Form Options" to collapse the form again.
    *   **Reset Form:** Click the "Reset form" link within the form to clear all input fields to their default values.

## Future Enhancements (Ideas)

*   User authentication(done) to save tables(next).
*   More advanced table customization options (e.g., specific column types).
*   Direct integration with TTRPG platforms.(far future)
*   Ability to re-roll individual rows in a table.(next)
*   Ability to generate images from individual rows in a table.(soon)


## Contributing

(Details on how to contribute to the project, if open for contributions. This would include coding standards, pull request processes, etc.)

## License

(Specify the license for the project, e.g., MIT, Apache 2.0.)
