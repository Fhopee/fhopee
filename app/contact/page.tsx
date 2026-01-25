import ContactForm from '@/components/ContactForm';

export default function ContactPage() {
  return (
    <div className="contact">
        <div className="grid">
            <ContactForm />
            
            <div className="info-col">
                <div className="info-item">
                    <div className="info-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path><polyline points="22,6 12,13 2,6"></polyline></svg>
                    </div>
                    <div className="info-content">
                        <h3>Email Us</h3>
                        <p>Contact our sales or service team.</p>
                        <a href="mailto:info@fhopepack.com">info@fhopepack.com</a><br />
                        <a href="mailto:fhopepack@gmail.com">fhopepack@gmail.com</a>
                    </div>
                </div>
                <div className="info-item">
                    <div className="info-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                    </div>
                    <div className="info-content">
                        <h3>Call Us</h3>
                        <p>We are available during business hours.</p>
                        <a href="tel:008613951501635">Mobile/Whatsapp/Wechat: 0086-13951501635</a>
                    </div>
                </div>
                <div className="info-item">
                    <div className="info-icon">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"></path><circle cx="12" cy="10" r="3"></circle></svg>
                    </div>
                    <div className="info-content">
                        <h3>Our Locations</h3>
                        <p>
                            <strong>Shanghai Office:</strong> B1130, Bldg 5, No.2758 songjin road, Shanghai.
                            <br />
                            <strong>Kunshan Factory:</strong> No.1428 North road shipu fengshou, Kunshan.
                        </p>
                    </div>
                </div>
                <div className="map">
                    <iframe 
                        height="300" 
                        allowFullScreen
                        loading="lazy" 
                        referrerPolicy="no-referrer-when-downgrade" 
                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3422.373268894267!2d120.99902631564883!3d31.48625995738676!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x35b39920170a3f7b%3A0x6398363825851416!2sQiandeng%2C%20Kunshan%2C%20Suzhou%2C%20Jiangsu%2C%20China!5e0!3m2!1sen!2sus!4v1624834458896!5m2!1sen!2sus&language=en">
                    </iframe>
                </div>
            </div>
        </div>
    </div>
  );
}

