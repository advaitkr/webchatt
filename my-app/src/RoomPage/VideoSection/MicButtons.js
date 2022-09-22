import React,{ useState} from 'react';
import MicButtonImg from "../../resources/images/microphone-svgrepo-com.svg";
import MicButtonImgoff from "../../resources/images/micoff.svg"
const MicButtons = () => {
    const [isMicMuted,setIsMicMuted] = useState(false);
    const handleMicButtonPressed = ()=>{
        setIsMicMuted(!isMicMuted)
    }

    return (
        <div className='video_button_container'>
            <img src={isMicMuted ? MicButtonImgoff : MicButtonImg} 
            onClick={handleMicButtonPressed}
            className="video_button_image"
            style = {{height:"40px"}}
            />
        </div>
    );
};

export default MicButtons;