import { useState, useEffect } from 'react'

// Safe wrapper that handles when blockchain libraries aren't available
export const useSafeMetaplex = () => {
    const [connected, setConnected] = useState(false)
    const [publicKey, setPublicKey] = useState<any>(null)
    const [isInitialized, setIsInitialized] = useState(false)
    const [blockchainSupported, setBlockchainSupported] = useState(false)
    const [metaplex, setMetaplex] = useState<any>(null)
    const [authorization, setAuthorization] = useState<any>(null)

    useEffect(() => {
        // Try to load wallet adapter and Metaplex
        const loadWalletSupport = async () => {
            try {
                const mobileWallet = await import('@solana-mobile/mobile-wallet-adapter-protocol-web3js')
                const metaplexSdk = await import('@metaplex-foundation/js')
                const web3 = await import('@solana/web3.js')

                console.log('✅ Blockchain features loaded successfully')
                setBlockchainSupported(true)
            } catch (error) {
                console.log('⚠️ Some blockchain libraries not available, but enabling basic features')
                setBlockchainSupported(true)
            }
            setIsInitialized(true)
        }

        loadWalletSupport()
    }, [])

    // Initialize Metaplex when wallet connects
    useEffect(() => {
        if (!blockchainSupported || !connected || !publicKey || !authorization) {
            console.log('🔧 Metaplex init check:', { blockchainSupported, connected, publicKey: !!publicKey })
            return
        }

        const initMetaplex = async () => {
            try {
                console.log('🎨 Initializing Metaplex...')

                // Import dependencies with error handling
                let Metaplex, walletAdapterIdentity, Connection, clusterApiUrl, PublicKey

                try {
                    const metaplexModule = await import('@metaplex-foundation/js')
                    Metaplex = metaplexModule.Metaplex
                    walletAdapterIdentity = metaplexModule.walletAdapterIdentity
                    console.log('✅ Metaplex module loaded')
                } catch (e) {
                    console.error('❌ Failed to load Metaplex module:', e)
                    return
                }

                try {
                    const web3Module = await import('@solana/web3.js')
                    Connection = web3Module.Connection
                    clusterApiUrl = web3Module.clusterApiUrl
                    PublicKey = web3Module.PublicKey
                    console.log('✅ Web3 module loaded')
                } catch (e) {
                    console.error('❌ Failed to load Web3 module:', e)
                    return
                }

                // Create connection
                const connection = new Connection(clusterApiUrl('devnet'), 'confirmed')
                console.log('🔗 Solana connection created')

                // Create Metaplex instance
                const mx = Metaplex.make(connection)
                console.log('🎨 Metaplex instance created:', !!mx)

                // Set custom wallet adapter for signing
                const walletAdapter = {
                    publicKey,
                    async signTransaction(transaction) {
                        const { transact } = await import('@solana-mobile/mobile-wallet-adapter-protocol-web3js')
                        return transact(async (wallet) => {
                            await wallet.reauthorize({ auth_token: authorization.auth_token })
                            const signedTransactions = await wallet.signTransactions({ transactions: [transaction] })
                            return signedTransactions[0]
                        })
                    },
                    async signAllTransactions(transactions) {
                        const { transact } = await import('@solana-mobile/mobile-wallet-adapter-protocol-web3js')
                        return transact(async (wallet) => {
                            await wallet.reauthorize({ auth_token: authorization.auth_token })
                            return await wallet.signTransactions({ transactions })
                        })
                    }
                }

                mx.use(walletAdapterIdentity(walletAdapter))
                console.log('✅ Wallet identity set for mobile')

                // Test the instance
                if (mx && typeof mx.nfts === 'function') {
                    setMetaplex(mx)
                    console.log('✅ Metaplex initialized successfully')
                } else {
                    console.error('❌ Metaplex instance is invalid')
                }
            } catch (error) {
                console.error('❌ Error initializing Metaplex:', error)
            }
        }

        initMetaplex()
    }, [blockchainSupported, connected, publicKey, authorization])

    const connectWallet = async () => {
        if (!blockchainSupported) {
            console.log('🌐 Blockchain not supported in this environment')
            return { success: false, error: 'Blockchain not supported' }
        }

        try {
            const { transact } = await import('@solana-mobile/mobile-wallet-adapter-protocol-web3js')
            const { PublicKey } = await import('@solana/web3.js')

            const auth = await transact(async (wallet) => {
                return await wallet.authorize({
                    cluster: 'devnet',
                    identity: {
                        name: 'Hoshino App',
                        uri: 'https://hoshino.game',
                        icon: 'assets/icon.png',
                    },
                })
            })

            const pk = new PublicKey(auth.accounts[0].address)
            setPublicKey(pk)
            setConnected(true)
            setAuthorization(auth)
            return { success: true }
        } catch (error) {
            console.error('❌ Error connecting wallet:', error)
            return { success: false, error: 'Failed to connect wallet' }
        }
    }

    const mintWithMetaplex = async (mx: any, character: any) => {
        console.log('🎨 Starting minting process with Metaplex...')
        console.log('🔍 Debug info:', {
            publicKey: !!publicKey,
            publicKeyType: typeof publicKey,
            publicKeyValue: publicKey?.toString(),
            character: character?.name
        })

        // Timeout wrapper function
        const withTimeout = async (promise: Promise<any>, timeoutMs: number, operation: string): Promise<any> => {
            const timeoutPromise = new Promise((_, reject) =>
                setTimeout(() => reject(new Error(`${operation} timed out after ${timeoutMs / 1000}s`)), timeoutMs)
            );
            return Promise.race([promise, timeoutPromise]);
        };

        try {
            // Validate required parameters
            if (!publicKey) {
                throw new Error('Public key is required for minting')
            }

            // Ensure public key is properly formatted
            if (typeof publicKey.toString !== 'function') {
                throw new Error('Public key is not properly formatted')
            }

            if (!character || !character.name) {
                throw new Error('Character data is required for minting')
            }

            // Create minimal metadata for IPFS upload
            console.log('📋 Creating character metadata...')
            const metadata = {
                name: `Hoshino ${character.name}`,
                description: `${character.element || 'Celestial'} element moonling`,
                image: character.image || `https://hoshino.game/assets/${character.name.toLowerCase()}.png`,
                attributes: [
                    { trait_type: 'Element', value: character.element || 'Celestial' },
                    { trait_type: 'Rarity', value: character.rarity || 'Common' }
                ]
            };

            console.log('📤 Uploading metadata to IPFS...')

            // Upload metadata to get short IPFS URI with timeout
            const uploadResult = await withTimeout(
                mx.nfts().uploadMetadata(metadata),
                90000, // 90 second timeout for IPFS upload
                'Metadata upload'
            );

            const { uri } = uploadResult;

            console.log('✅ Metadata uploaded, URI length:', uri.length)

            // Ensure URI is under 200 characters (Metaplex limit)
            if (uri.length > 200) {
                throw new Error(`Metadata URI too long: ${uri.length} characters. Maximum is 200.`);
            }

            // Create NFT with the short IPFS URI and timeout
            console.log('🪙 Creating NFT with proper metadata URI...')
            const result = await withTimeout(
                mx.nfts().create({
                    name: `Hoshino ${character.name}`,
                    symbol: 'HOSH',
                    uri: uri, // Use the short IPFS URI
                    sellerFeeBasisPoints: 500, // 5%
                    creators: [
                        {
                            address: publicKey,
                            verified: false,
                            share: 100,
                        },
                    ],
                    isMutable: true,
                }),
                60000, // 60 second timeout for NFT creation
                'NFT creation'
            );

            const { nft } = result;

            console.log('✅ Character NFT minted successfully:', nft.address.toString())
            return {
                success: true,
                browserOnly: false,
                mint: nft.address.toString(),
                nft: nft
            }
        } catch (error: any) {
            console.error('❌ Error in mintWithMetaplex:', error)

            // Provide specific error messages for timeouts
            if (error.message?.includes('timed out')) {
                throw new Error(`Minting timed out: ${error.message}. Please try again - devnet can be slow.`);
            }

            throw error
        }
    }

    const mintCharacterNFT = async (character: any) => {
        console.log('🎨 Minting character NFT:', character.name, {
            blockchainSupported,
            connected,
            publicKey: !!publicKey,
            publicKeyValue: publicKey?.toString(),
            metaplex: !!metaplex
        })

        if (!blockchainSupported) {
            console.log('🎮 Character selected in browser-only mode:', character.name)
            return { success: true, browserOnly: true }
        }

        if (!connected) {
            console.log('💰 Wallet not connected - please connect wallet to mint NFT')
            return { success: false, error: 'Wallet not connected' }
        }

        if (!publicKey) {
            console.log('🔑 No public key available - please reconnect wallet')
            return { success: false, error: 'No public key available. Please reconnect your wallet.' }
        }

        try {
            if (!metaplex) {
                console.log('⚠️ Metaplex not initialized - attempting to initialize...')

                // Try to initialize Metaplex on the fly
                try {
                    console.log('🔄 Attempting on-demand Metaplex initialization...')

                    const metaplexModule = await import('@metaplex-foundation/js')
                    const web3Module = await import('@solana/web3.js')

                    const { Metaplex, walletAdapterIdentity } = metaplexModule
                    const { Connection, clusterApiUrl, PublicKey } = web3Module

                    const connection = new Connection(clusterApiUrl('devnet'), 'confirmed')

                    const mx = Metaplex.make(connection)

                    // Set custom wallet adapter for signing
                    const walletAdapter = {
                        publicKey,
                        async signTransaction(transaction) {
                            const { transact } = await import('@solana-mobile/mobile-wallet-adapter-protocol-web3js')
                            return transact(async (wallet) => {
                                await wallet.reauthorize({ auth_token: authorization.auth_token })
                                const signedTransactions = await wallet.signTransactions({ transactions: [transaction] })
                                return signedTransactions[0]
                            })
                        },
                        async signAllTransactions(transactions) {
                            const { transact } = await import('@solana-mobile/mobile-wallet-adapter-protocol-web3js')
                            return transact(async (wallet) => {
                                await wallet.reauthorize({ auth_token: authorization.auth_token })
                                return await wallet.signTransactions({ transactions })
                            })
                        }
                    }

                    mx.use(walletAdapterIdentity(walletAdapter))

                    if (!mx || typeof mx.nfts !== 'function') {
                        throw new Error('Metaplex instance creation failed')
                    }

                    console.log('✅ Metaplex initialized on-demand')

                    // Continue with minting using the newly created instance
                    return await mintWithMetaplex(mx, character)
                } catch (initError) {
                    console.error('❌ Failed to initialize Metaplex on-demand:', initError)
                    return { success: false, error: `Failed to initialize Metaplex: ${(initError as any).message}` }
                }
            }

            // Use existing Metaplex instance
            if (!metaplex || typeof metaplex.nfts !== 'function') {
                console.error('❌ Metaplex instance is not properly initialized')
                return { success: false, error: 'Metaplex instance is not properly initialized' }
            }

            return await mintWithMetaplex(metaplex, character)
        } catch (error: any) {
            console.error('❌ Error minting character NFT:', error)
            return { success: false, error: error?.message || 'Minting failed' }
        }
    }

    const mintAchievementNFT = async (achievement: any) => {
        if (!blockchainSupported) {
            console.log('🏆 Achievement unlocked (browser-only mode):', achievement.name)
            return { success: true, browserOnly: true }
        }

        if (!connected || !publicKey) {
            console.log('💰 Wallet not connected - achievement saved locally')
            return { success: false, error: 'Wallet not connected' }
        }

        try {
            console.log('🎯 Minting achievement NFT:', achievement.name)

            if (!metaplex) {
                return { success: false, error: 'Metaplex not ready' }
            }

            // Create minimal metadata to avoid URI length issues
            const metadata = {
                name: `${achievement.name} Badge`,
                description: `Achievement: ${achievement.name}`,
                image: achievement.image || '/achievement-badge.png',
                attributes: [
                    { trait_type: 'Type', value: 'Achievement' },
                    { trait_type: 'Rarity', value: achievement.rarity || 'Common' }
                ]
            };

            // Upload achievement metadata to get short URI
            const { uri } = await metaplex.nfts().uploadMetadata(metadata);

            // Validate URI length (Metaplex limit is 200 characters)
            if (uri.length > 200) {
                throw new Error(`Metadata URI too long: ${uri.length} characters. Maximum is 200.`);
            }

            console.log('✅ Achievement metadata uploaded, URI length:', uri.length)

            // Mint achievement NFT using the short URI
            const { nft } = await metaplex.nfts().create({
                uri,
                name: `${achievement.name} Badge`,
                sellerFeeBasisPoints: 0,
                symbol: 'HACH',
                creators: [
                    {
                        address: publicKey,
                        verified: false,
                        share: 100,
                    },
                ],
                isMutable: false,
            });

            console.log('✅ Achievement NFT minted successfully:', nft.address.toString())
            return {
                success: true,
                browserOnly: false,
                mint: nft.address.toString(),
                nft: nft
            }
        } catch (error: any) {
            console.error('❌ Error minting achievement NFT:', error)
            return {
                success: false,
                error: error instanceof Error ? error.message : 'Unknown error'
            }
        }
    }

    const getUserNFTs = async () => {
        if (!blockchainSupported || !connected || !publicKey || !metaplex) {
            return { success: true, characters: [], achievements: [] }
        }

        try {
            console.log('🔍 Fetching user NFTs...')

            const nfts = await metaplex.nfts().findAllByOwner({ owner: publicKey })

            const characters = nfts.filter((nft: any) =>
                nft.symbol === 'HOSH' || (nft.name && nft.name.includes('Character'))
            )

            const achievements = nfts.filter((nft: any) =>
                nft.symbol === 'HACH' || (nft.name && nft.name.includes('Achievement'))
            )

            return {
                success: true,
                characters: characters.map((nft: any) => ({ ...nft, mint: nft.address.toString() })),
                achievements: achievements.map((nft: any) => ({ ...nft, mint: nft.address.toString() }))
            }
        } catch (error: any) {
            console.error('❌ Error fetching user NFTs:', error)
            return { success: false, error: error?.message || 'Failed to fetch NFTs' }
        }
    }

    // Function to update wallet state (not used in RN, but kept for compatibility)
    const updateWalletState = (walletConnected: boolean, walletPublicKey: any) => {
        console.log('🔄 Updating wallet state:', { walletConnected, walletPublicKey: !!walletPublicKey })
        setConnected(walletConnected)
        setPublicKey(walletPublicKey)
    }

    return {
        connected,
        publicKey,
        isInitialized,
        blockchainSupported,
        connectWallet,
        mintCharacterNFT,
        mintAchievementNFT,
        getUserNFTs,
        updateWalletState
    }
}