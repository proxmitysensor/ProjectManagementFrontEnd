import { AuthenticatedTemplate } from "@azure/msal-react";
import { NavigationBar } from "./NavigationBar";

export const PageLayout = (props) => {
    return (
        <>
            <NavigationBar />
            <br />
            <h5>
                <center>Project Management Front End</center>
            </h5>
            <br />
            {props.children}
            <br />
            <AuthenticatedTemplate>
                <footer>
                    <center>
                       <p>This is the footer</p>
                    </center>
                </footer>
            </AuthenticatedTemplate>
        </>
    );
}