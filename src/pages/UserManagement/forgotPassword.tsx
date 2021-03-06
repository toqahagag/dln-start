import React, { Fragment, useEffect, useState } from "react";
import Card from "../../components/Layout/layout";
import { Row, Col, Form, Spinner } from "react-bootstrap";
import { useHistory, useParams, withRouter } from "react-router-dom";
import { API, Auth } from "aws-amplify";
import Menu from "../../components/Layout/menu";
import strings from "../../localization/localization";
import Footer from "../../components/Layout/footer";
import loader from "../../Assets/Images/loader.gif";
import { getMFIData } from '../../API/api';

function ForgotPassword(props) {
  let history: any = useHistory();
  let { mfi }: any = useParams();

  const IntialInputs = () => ({
    inputs: {
      phone: "",
    },
  });
  const [state, setState] = useState(IntialInputs());
  const [loading, setLoading] = useState(false);
  const [showErrors, setShowErrors] = useState(false)
  var [errors, setErrors] = useState({
    identity: "",
    submitMsg: "",
    error: false
  });
  const [codeVerifyState, setCodeVerifyState] = useState(false)

  const handleClick = async () => {
    setShowErrors(true)
    // request verification code 
    const identityValidation = /^([a-zA-Z0-9_\.\-])+\@(([a-zA-Z0-9\-])+\.)+([a-zA-Z0-9]{2,4})|([0-9]{10})+$/;

    if (!state.inputs.phone.replace(/\s/g, "").length) {
      setErrors({ identity: "Please, enter a valid phone number", submitMsg: '', error: true });
    } else if (!identityValidation.test(state.inputs.phone.trim())) {
      setErrors({ identity: "This Phone is not valid", submitMsg: '', error: true });
    } else {
      setErrors({ identity: "", submitMsg: '', error: false })
      setLoading(true);
      let filteredIdentity = "";
      let identity = state.inputs.phone
      if (!identity.includes("+") && !identity.includes("+1")) {
        const emailOrPhoneCheck = /\S+@\S+\.\S+/;
        !emailOrPhoneCheck.test(identity)
          ? identity.length === 10
            ? (filteredIdentity = `+1${identity}`)
            : (filteredIdentity = `+${identity}`)
          : (filteredIdentity = identity);
      }
      filteredIdentity = filteredIdentity ? filteredIdentity : identity;
      
      try {
        let forget = await Auth.forgotPassword(filteredIdentity.trim());
        
        let storage: any = localStorage.getItem("mfiData");
        let mfiData: any = storage ? JSON.parse(storage) : null;
        if (mfiData?.name || mfi) {
          history.push({
            pathname: `/App/resetPassword/${mfi ? mfi : mfiData?.name}`, props: { state }
          });
        } else {
          
          history.push({
            pathname: `/App/resetPassword`,
            props: { state },
          });
        }
        setLoading(false);

      } catch (err) {
        alert(err.message ? err.message : err)
        setLoading(false);
      }
    }
  };

  useEffect(() => {
    const language: any = localStorage.getItem("language");
    if (language) {
      strings.setLanguage(language);
    }
    if (mfi) {
      handleMfi(mfi);
    } else {
      setEnterAPI(true);
    }
  }, []);
  
  const [enterAPI, setEnterAPI] = useState(false);

 // fetch mfi data
 const handleMfi = async (mfiName) => {
  const response: any = await getMFIData(mfiName)
  if (response) {
    setEnterAPI(true);
  } else {
    setEnterAPI(true);
  }
}
  const handleChange = (e) => {
    const { value, name } = e.target;
    const { inputs } = state;
    inputs[name] = value;
    setState({
      ...state,
      inputs,
    });

  };
  return (
    <Fragment>
      {!enterAPI ? (
      <Row className="align-items-center h-100-vh">
      <Col>
           <img src={loader} className="loader-img" width="200" />
      </Col>
    </Row>
      ) : (
        <Fragment>
          {enterAPI && <Menu isStart={true} />}
          <Card>
            <Form className="app-form">
                <Row>
                  <Col className="text-left">
                    <Form.Group>
                      <Form.Label>{strings.phone}</Form.Label>
                      <Form.Control type="text" placeholder={strings.phone} value={state.inputs.phone} name="phone" onChange={(e) => {
                        handleChange(e);
                      }} />
                      {showErrors === true &&
                        errors.error && (
                          <div className="app-error-msg">{errors.identity}</div>
                        )}
                    </Form.Group>
                  </Col>
                </Row>

              <button
                type="button"
                className="app-primary-btn"
                onClick={handleClick}
                disabled={
                  state.inputs.phone.length <= 0 ||
                  loading
                }
              >
                {!codeVerifyState ? 'Send Code' : strings.verify}

              </button>
            </Form>

          </Card>
          <Row className='justify-content-center'>
            <Col xl={7} lg={7} md={7} sm={12}><Footer /></Col></Row>
        </Fragment>
      )}
    </Fragment>
  );
}
export default withRouter(ForgotPassword);
