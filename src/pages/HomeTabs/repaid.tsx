import React, { Fragment, useState, useEffect,useRef } from "react";
import { Row, Col, Spinner } from "react-bootstrap";
import SingleProposal from "../../components/ManageProposal/singleProposal";
import  { useOutsideAlerter  } from '../../Helpers'
import { useUserState } from "contexts/UserAuthContext";
import strings from "../../localization/localization";
import Loader from "../../components/Layout/loader";
import LoanInfo from "../../components/LoanStats/loanInfo";

function Repaid({repaidProposals,handleCallSpinner,loanData}) {
  const { user }: any = useUserState();
  const [proposals, setProposals]:any = useState(repaidProposals);
  const [loadProposals, setLoadProposals] = useState(false);
  const [callSpinnerFlag, setCallSpinnerFlag] = useState(false);
 
  useEffect(() => {
    (async () => {
      const language: any = localStorage.getItem("language");
      if (language) {
        strings.setLanguage(language);
      }

    })();
  }, []);
  let _user:any={}


  const wrapperRef = useRef(null);
  //remove demo mode popover when click outside container
  useOutsideAlerter(wrapperRef);

  return (
    <Fragment>
      {loadProposals ? (
        <Row className="mt-5 min-height-100">
          <Col>
           <Loader/>
          </Col>
        </Row>
      ) : (
        <div ref={wrapperRef} className="min-height-100">
         <LoanInfo loanData={loanData}/>
     
          {proposals &&
            proposals.map((p: any, index) => (
              <Row key={index}>
                <Col>
                  <SingleProposal
                    data={p}
                    callSpinner={handleCallSpinner}
                    CallAddProposalCanceled=""
                    isBorrow={true}
                  />
                </Col>
              </Row>
            ))}
                   {proposals&&proposals.length<=0 &&
               
               <Row className='mt-5'>
                 <Col>
                 <h4>{strings.noDataToShow}</h4>
                 </Col>
               </Row>
             }
        </div>
      )}
    </Fragment>
  );
}
export default Repaid;
