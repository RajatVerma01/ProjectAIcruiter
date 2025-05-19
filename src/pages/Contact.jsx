import "./Contact.css"
function Contact(){
    return(<>
            <div className="contact-page">
                <div className="contact-area">
                    <div className="left-contact-area">
                        <h1 class="head">Stuck somewherer, Don't worry</h1>
                        <h1 class="head2">Query Now</h1>
                        <img src="/Untitled design (2).png" alt="" />
                    </div>
                    <div className="right-contact-area">
                        <input type="text" placeholder="Name"/>
                        <input type="email" placeholder="Email"/>
                        <textarea name="" id="" placeholder="Your query"></textarea>
                        <button>Submit Now</button>
                    </div>
                </div>
            </div>
    </>);
}
export default Contact;