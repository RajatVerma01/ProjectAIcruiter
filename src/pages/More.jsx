import './More.css'
import { useNavigate } from 'react-router-dom'

function More() {
    const navigate = useNavigate();
    
    const handleClick = () => {
        navigate('/schedule');
    };

    return (
        <div className="more-page">
            <div className="content-box">
                <div className="left-content">
                    <h1>Schedule your interview just</h1>
                    <h2>Join us for a revolutionary change </h2>
                    <button onClick={handleClick}>
                        Schedule Now
                    </button>
                </div>
                <div className="right-content">
                    <p>Visit us to know more</p>
                    <h1>NOW ON</h1>
                    <h2>AIcruiter</h2>
                </div>
            </div>
        </div>
    );
}
export default More;
