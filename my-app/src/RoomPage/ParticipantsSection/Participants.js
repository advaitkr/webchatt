import React from 'react';
import {connect} from 'react-redux'

const SingleParticipant = (props) => {
    const { identity, lastItem, participant,socketId} = props


    return (
        <>
            <p className='participants_paragraph'>{identity}</p>
            {!lastItem && <span className='participants_separator_line'></span>}

        </>


    )

}


const Participants = ({participants,socketId}) => {
    return (<div className='participants_container'>
        {participants.map((participant, index) => {
            return (

                <SingleParticipant
                key={participant.identity}
                lastItem={participants.length === index + 1}
                participant={participant}
                identity={participant.identity}
                socketId={socketId}
                />

            )


        })


        }

    </div>

    )

};

const mapStoreStateToProps = (state) => {
    return {
      ...state,
    };
  };
  
export default connect(mapStoreStateToProps)(Participants);