import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const OAuthSuccess = () => {
    const navigate = useNavigate();

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);

        const user = {
            email: params.get("email"),
            name: params.get("name"),
            picture: params.get("picture"),
        };
        console.log(user);
        if (user.email) {
            localStorage.setItem("user", JSON.stringify(user));
            navigate("/");
        }
    }, []);

    return <h2>Logging you in...</h2>;
};

export default OAuthSuccess;