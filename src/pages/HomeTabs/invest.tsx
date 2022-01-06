import React, { Fragment, useEffect, useState } from "react";

import { Row, Col, Spinner } from "react-bootstrap";
import SingleProposal from "../../components/ManageProposal/singleProposal";
import { API } from "aws-amplify";
import FilterationBar from "../../components/ManageProposal/filterationBar";
import { useUserState } from "contexts/UserAuthContext";
import strings from "../../localization/localization";
import Loader from "../../components/Layout/loader";
import {ProposalStatus} from "../../Enums/ProposalStatus";

function Invest() {
  const { user }: any = useUserState();

  const [proposals, setProposals] = useState([]);
  const [filteredProposals, setFilteredProposals] = useState([]);
  const [loadProposals, setLoadProposals] = useState(false);
  const [clickedFilter, setClickedFilter] = useState();
  const [callSpinnerFlag, setCallSpinnerFlag] = useState(false);
  

  const [userActiveBalance , setUserActiveBalance] = useState(0.0)
  const [userPassiveBalance , setUserPassiveBalance] = useState(0.0)
  const href = window.location.href
  let userData:any={};

  useEffect(() => {
    (async () => {
      getProposals();
      getUserBalanceStatus()
    })();
  }, [href]);

  //fetch current user balances 
  const getUserBalanceStatus = async () => {
    let data = localStorage.getItem('userData');
    if(data){
     userData=JSON.parse(data);
    }
    setLoadProposals(true);
    const balance = await API.get("auth", "/api/borrow/userStats", {
      headers: { "Content-Type": "application/json" },
      queryStringParameters: {userId:userData.id},
    });
    if (balance.success){
      setUserActiveBalance(balance.data.active.amount)
      setUserPassiveBalance(balance.data.pasive.amount)
    }
  }

  //fetch others proposals to invest in it
  const getProposals = async () => {
    let data = localStorage.getItem('userData');
    if(data){
     userData=JSON.parse(data);
    }
    setLoadProposals(true);
    const proposals = await API.get("auth", "/api/borrow/proposalsNotByUserAddress", {
      headers: { "Content-Type": "application/json" },
      queryStringParameters: { address: userData.id,userId:userData.id},
    });
    setProposals(proposals.data.filter((prop: any) => (prop.status !== ProposalStatus.drafted && prop.status!==ProposalStatus.repaid)));
    setFilteredProposals(proposals.data.filter((prop: any) => (prop.status !== ProposalStatus.drafted && prop.status!==ProposalStatus.repaid)));
    setLoadProposals(false);
  };

  //handle filtering proposal according to status
  const handleFilter = (filter) => {
    let data;
    setLoadProposals(true);
    if (filter !== 0) {
      data = proposals.filter((prop: any) => prop.status === filter);
    } else {
      data = proposals;
    }
    setClickedFilter(filter);
    setTimeout(function() {
      setFilteredProposals(data);
      setLoadProposals(false);
    });
  };
  useEffect(() => {
   if(clickedFilter) {
     handleFilter(clickedFilter);
    }
}, [callSpinnerFlag]);

//refetch data after updating proposal
  const handleCallSpinner=async()=>{
    await getProposals();
  setCallSpinnerFlag(!callSpinnerFlag);
  }

  return (
    <Fragment>
      {loadProposals ? (
        <Row className="mt-5 min-height-100">
          <Col>
              <Loader/>
          </Col>
        </Row>
      ) : (
        <div className="min-height-100">
          <Row className="justify-content-center app-inner-page app-inner-page-tab">
            <Col xl={12} lg={12} md={12} sm={12} className="card app-card pb-5">
              <div className="app-card-title d-flex align-self-center  mt-3 justify-content-center">
                <h3>{strings.investmentIncome}</h3>
              </div>
              <Row className="mt-1">
                <Col>
                  <div className="app-boxed-data">
                    <div>{strings.activeROÍ}</div>
                    <div className="app-text-blue">${userActiveBalance}</div>
                  </div>
                </Col>
                <Col>
                  <div className="app-boxed-data">
                    <div>{strings.myInvestmentOÍ}</div>
                    <div className="app-text-blue">${userPassiveBalance}</div>
                  </div>
                </Col>
              </Row>
            </Col>
          </Row>

<FilterationBar  parentClickedFilter={clickedFilter} isAddShow={false} isDraftShow={false} handleAddButton="" handleFilter={handleFilter} isShowRepaid={true}/>

          {filteredProposals &&
            filteredProposals.map((p: any, index) => (
              <Row key={index}>
                <Col>
                  <SingleProposal
                    data={p}
                    callSpinner={handleCallSpinner}
                    CallAddProposalCanceled=""
                    isShowOnly={true}
                  />
                </Col>
              </Row>
            ))}
                   {filteredProposals&&filteredProposals.length<=0 &&
               
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
export default Invest;
