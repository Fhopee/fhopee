'use client';

import React, { useRef, useState, useEffect } from 'react';
import emailjs from '@emailjs/browser';

export default function ContactForm() {
  const form = useRef<HTMLFormElement>(null);
  const [status, setStatus] = useState<'idle' | 'sending' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const sendEmail = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!form.current) return;

    setStatus('sending');

    const currentForm = form.current;
    
    // Set URL
    const urlInput = currentForm.querySelector('input[name="url"]') as HTMLInputElement;
    if (urlInput) {
        urlInput.value = window.location.href;
    }

    try {
        await emailjs.sendForm('service_mqg62ar', 'template_9s54uen', currentForm, {
            publicKey: 'kOSbT2m1XQpGi_npm',
        });
        setStatus('success');
        currentForm.reset();
        setTimeout(() => setStatus('idle'), 5000);
    } catch (error: any) {
        setStatus('error');
        setErrorMessage('Oops! There was a problem sending your message.');
        console.error('FAILED...', error);
    }
  };

  return (
    <div className="inquiry-form-container">
        <div className="inquiry-form__header">
            <h2>Contact Us</h2>
            <p>Our senior engineers will provide a free technical consultation within 2 working hours.</p>
        </div>
        
        <form ref={form} onSubmit={sendEmail} className="inquiry-form">
            <div className="inquiry-form__row">
                <input type="text" name="uname" placeholder="*Name" required className="inquiry-form__input" />
                <input type="email" name="email" placeholder="*Email Address" required className="inquiry-form__input" />
            </div>
            <div className="inquiry-form__group">
                <input type="tel" name="mobile" placeholder="Phone Number" className="inquiry-form__input" />
            </div>
            <div className="inquiry-form__group" style={{ paddingBottom: '18px' }}>
                <input type="text" name="company" placeholder="Your Website" className="inquiry-form__input" />
            </div>
            <div style={{ padding: '20px' }}></div>
            <div className="inquiry-form__group">
                <textarea name="msg" placeholder="*Your Message / Inquiry" required className="inquiry-form__input inquiry-form__textarea"></textarea>
            </div>

            <input type="hidden" name="url" />
            <input type="hidden" name="ip_address" />

            <div className="inquiry-form__submit-wrapper">
                <button type="submit" className="inquiry-form__submit" disabled={status === 'sending'}>
                    {status === 'sending' ? 'SENDING...' : 'Send Message'}
                </button>
            </div>
        </form>

        {status === 'success' && (
            <div className="alert alert-success" role="alert">
                Submit sucessful! Our team will reply in working 2 hours.
            </div>
        )}
        {status === 'error' && (
            <div className="alert alert-danger" role="alert">
                {errorMessage}
            </div>
        )}
    </div>
  );
}

