import React, { useContext, useEffect, useState } from 'react';
import { SupabaseContext } from './SupabaseContext';

const AccountPage = ({ isOpen, onModalClose }) => {
    const [account, setAccount] = useState(null);

    const supabase = useContext(SupabaseContext);

    useEffect(() => {
        async function getAccount() {
            const tempAccount = await supabase.auth.getUser()
            setAccount(tempAccount);
        }
        getAccount()
    }, [])

    return (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
            <div className="w-full max-w-sm p-6 bg-white border border-gray-200 rounded-lg shadow-lg">
                <button onClick={onModalClose}>X</button>
                <h5 className="text-xl font-medium text-black">Account Page</h5>
                <br />
                {
                    account ?
                        account.data.user ?
                            <div>
                                <p>Display Name: {account.data.user.user_metadata.display_name}</p>
                                <p>Email: {account.data.user.user_metadata.email}</p>
                                <p>Email Verified: {account.data.user.user_metadata.email_verified}</p>
                            </div>
                            :
                            <p>Sign In To View Your Account</p>
                        :
                        <p>Sign In To View Your Account</p>
                }
                
            </div>
        </div>
    );
};

export default AccountPage;