import { 
    createMint, 
    getMinimumBalanceForRentExemptMint, 
    createInitializeMint2Instruction,
    TOKEN_PROGRAM_ID
} from "@solana/spl-token";
import { useWallet } from "@solana/wallet-adapter-react";
import { 
    Transaction, 
    SystemProgram, 
    Connection, 
    Keypair, 
    sendAndConfirmTransaction 
} from "@solana/web3.js";

export function TokenLaunchpad() {
    // Solana connection and wallet
    const connection = new Connection("https://api.devnet.solana.com", "confirmed");
    const wallet = useWallet();

    async function createToken() {
        if (!wallet.publicKey) {
            alert("Please connect your wallet!");
            return;
        }
    
        try {
            // Get the minimum balance for rent exemption
            const lamports = await getMinimumBalanceForRentExemptMint(connection);
    
            // Generate a new mint keypair
            const mintKeypair = Keypair.generate();
    
            // Define constants
            const decimals = 9; // Token decimals
            const mintAuthority = wallet.publicKey;
            const freezeAuthority = wallet.publicKey; // Optional
            const MINT_SIZE = 82; // Size of the mint account
    
            // Fetch the recent blockhash
            const { blockhash } = await connection.getLatestBlockhash();
    
            // Create the transaction
            const transaction = new Transaction({
                recentBlockhash: blockhash,
                feePayer: wallet.publicKey,
            }).add(
                SystemProgram.createAccount({
                    fromPubkey: wallet.publicKey,
                    newAccountPubkey: mintKeypair.publicKey,
                    space: MINT_SIZE,
                    lamports,
                    programId: TOKEN_PROGRAM_ID, // Token program ID
                }),
                createInitializeMint2Instruction(
                    mintKeypair.publicKey,
                    decimals,
                    mintAuthority,
                    freezeAuthority,
                    TOKEN_PROGRAM_ID
                )
            );
    
            // Partially sign the transaction with the mint keypair
            transaction.partialSign(mintKeypair);
    
            // Sign the transaction with the wallet
            const signedTransaction = await wallet.signTransaction(transaction);
    
            // Send and confirm the transaction
            const signature = await sendAndConfirmTransaction(connection, signedTransaction, [mintKeypair, wallet]);
            alert(`Token created! Transaction Signature: ${signature}`);
        } catch (error) {
            console.error("Error creating token:", error);
            alert("An error occurred while creating the token.");
        }
    }
    

    return (
        <div
            style={{
                height: '100vh',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                flexDirection: 'column',
            }}
        >
            <h1>Solana Token Launchpad</h1>
            <input className="inputText" type="text" placeholder="Name" /> <br />
            <input className="inputText" type="text" placeholder="Symbol" /> <br />
            <input className="inputText" type="text" placeholder="Image URL" /> <br />
            <input className="inputText" type="text" placeholder="Initial Supply" /> <br />
            <button className="btn" onClick={createToken}>
                Create a Token
            </button>
        </div>
    );
}
