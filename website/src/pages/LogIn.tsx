import React, { FormEvent, useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { user } from "../App";
import { fetchFromAPI } from "../backend";
import InputBox from "../components/Forms/InputBox";
import LoadingScreen, { LoadingButton } from "../components/LoadingScreen";
import { Translation } from "../translations";

export default function LogIn({
  data,
  user,
  setUser,
}: {
  data: Translation;
  user: any;
  setUser: Function;
}) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [invalidCredentials, setInvalidCredentials] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (user) navigate("/profile");
  }, [user]);

  async function handleLogin(evt: FormEvent<HTMLFormElement>) {
    evt.preventDefault();
    setInvalidCredentials(false);
    setLoading(true);
    for (const func of [setEmail, setPassword]) {
      func("");
    }
    const fetchData = {
      email,
      password,
    };
    const res = await fetchFromAPI("auth/login", "POST", fetchData);
    const json = await res.json();
    setLoading(false);
    if (res.ok) {
      setUser(json as user);
    } else {
      setInvalidCredentials(true);
    }
  }

  if (loading) {
    return <LoadingScreen className="login-page" text={data.profile.loading} />;
  }

  return (
    <div className="login-page">
      <form className="login" onSubmit={handleLogin}>
        <InputBox
          label={data.formDetails.email}
          type="email"
          value={email}
          setValue={setEmail}
        />
        <InputBox
          label={data.formDetails.password}
          type="password"
          value={password}
          setValue={setPassword}
        />
        {invalidCredentials && (
          <p className="error-msg">{data.profile.invalidCredentials}</p>
        )}
        {loading ? (
          <LoadingButton className="login" color="white" />
        ) : (
          <button type="submit" className="login-btn submit-btn">
            {data.formDetails.login}
          </button>
        )}
      </form>
      <p>{data.formDetails.or}</p>
      <Link to="/signup" className="signup-btn">
        <i>{data.formDetails.signup}</i>
      </Link>
    </div>
  );
}
