import React, { useContext, useEffect, useState } from 'react';
import { SupabaseContext } from './SupabaseContext';

const AccountPage = ({ isOpen, onClose }) => {
    const [account, setAccount] = useState(null);

    const supabase = useContext(SupabaseContext);

    useEffect(() => {
        async function getAccount() {
            const tempAccount = await supabase.auth.getUser()
            console.log(tempAccount.data.user)
            setAccount(tempAccount);
        }
        getAccount()
    }, [])

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="w-full max-w-sm p-6 bg-white border border-gray-200 rounded-lg shadow-lg">
                <button onClick={onClose}>X</button>
                <h5>Account Page</h5>
                {/* <p>Display Name: {account ? account.data.user ? account.data.user.user_metadata.display_name : "" : ""}</p>
                <p>Email: {account ? account.data.user ? account.data.user.user_metadata.email : "" : ""}</p>
                <p>Email Verified: {account ? account.data.user ? account.data.user.user_metadata.email_verified ? "Yes" : "No" : "" : ""}</p> */}
            </div>
        </div>
    );
};

export default AccountPage;