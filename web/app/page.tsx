"use client";

import Link from "next/link";

// SVG Icons
const GamepadIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="6" x2="10" y1="11" y2="11"></line>
    <line x1="8" x2="8" y1="9" y2="13"></line>
    <line x1="15" x2="15.01" y1="12" y2="12"></line>
    <line x1="18" x2="18.01" y1="10" y2="10"></line>
    <rect width="20" height="12" x="2" y="6" rx="2"></rect>
  </svg>
);

const ShieldIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"></path>
  </svg>
);

const UsersIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"></path>
    <circle cx="9" cy="7" r="4"></circle>
    <path d="M22 21v-2a4 4 0 0 0-3-3.87"></path>
    <path d="M16 3.13a4 4 0 0 1 0 7.75"></path>
  </svg>
);

const TrophyIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path>
    <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path>
    <path d="M4 22h16"></path>
    <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"></path>
    <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"></path>
    <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"></path>
  </svg>
);

const ZapIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"></polygon>
  </svg>
);

const GlobeIcon = () => (
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="2" x2="22" y1="12" y2="12"></line>
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path>
  </svg>
);

const ArrowRightIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" x2="19" y1="12" y2="12"></line>
    <polyline points="12 5 19 12 12 19"></polyline>
  </svg>
);

const CheckIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"></polyline>
  </svg>
);

// Game data
const games = [
  {
    id: "minority-wins",
    title: "Minority Wins",
    description: "Pick the option you think will be least popular. The fewer people who choose your answer, the bigger your share of the pot.",
    status: "Live",
    statusColor: "bg-[#ff5a00]",
    comingSoon: false,
  },
  {
    id: "crown-the-favourite",
    title: "Crown the Favourite",
    description: "Predict who's going to win. But here's the twist — the more popular your pick, the smaller your reward.",
    status: "Coming Soon",
    statusColor: "bg-[#3f3f46]",
    comingSoon: true,
  },
];

// Features data
const features = [
  {
    icon: <ShieldIcon />,
    title: "Private Picks",
    description: "Your choices are encrypted on-chain. No one can see what you picked until the game ends.",
  },
  {
    icon: <UsersIcon />,
    title: "Social Games",
    description: "Compete with friends and the community on real-world events — elections, sports, awards shows.",
  },
  {
    icon: <TrophyIcon />,
    title: "Real Rewards",
    description: "Stake tokens and win based on how well you predict collective outcomes.",
  },
  {
    icon: <ZapIcon />,
    title: "Instant Settlement",
    description: "Games resolve automatically when events end. No manual payouts.",
  },
];

// How it works steps
const steps = [
  {
    number: "01",
    title: "Connect Wallet",
    description: "Link your Ethereum wallet to the platform. We support MetaMask and other major wallets.",
  },
  {
    number: "02",
    title: "Browse Active Games",
    description: "See what events are trending. Each game has a question and multiple options to choose from.",
  },
  {
    number: "03",
    title: "Make Your Pick",
    description: "Select your answer and stake your tokens. Your choice stays private until the event concludes.",
  },
  {
    number: "04",
    title: "Claim Winnings",
    description: "If you picked the minority position, claim your share of the pot.",
  },
];

// Stats data
const stats = [
  { value: "10K+", label: "Active Players" },
  { value: "$2.5M", label: "Total Staked" },
  { value: "150+", label: "Games Played" },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-[#f4f4f5]">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 border-b border-[#ececee] bg-[#f4f4f5]/95 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-[12px] bg-[#09090b]">
              <span className="text-sm font-semibold text-white">U</span>
            </div>
            <span className="text-xl font-semibold text-[#09090b]">uneventful</span>
          </div>
          
          <div className="hidden items-center gap-8 md:flex">
            <Link href="#games" className="text-sm text-[#52525b] hover:text-[#09090b] transition-colors">
              Games
            </Link>
            <Link href="#how-it-works" className="text-sm text-[#52525b] hover:text-[#09090b] transition-colors">
              How it Works
            </Link>
            <Link href="#features" className="text-sm text-[#52525b] hover:text-[#09090b] transition-colors">
              Features
            </Link>
          </div>
          
          <button className="rounded-[14px] bg-[#09090b] px-4 py-2 text-sm font-medium text-white transition-all hover:bg-[#27272a]">
            Connect Wallet
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20">
        <div className="mx-auto max-w-[1200px] px-6">
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-6 inline-flex items-center gap-2 rounded-[12px] border border-[#ececee] bg-white px-3 py-1.5">
              <span className="h-2 w-2 rounded-full bg-[#ff5a00]"></span>
              <span className="text-xs font-medium text-[#52525b]">Now live on Sepolia</span>
            </div>
            
            <h1 className="mb-6 text-5xl font-semibold leading-[1.12] text-[#09090b] md:text-[64px]">
              Predict the crowd.<br />
              <span className="text-[#52525b]">Win when you&apos;re in the minority.</span>
            </h1>
            
            <p className="mx-auto mb-10 max-w-xl text-lg text-[#71717a]">
              Social prediction games where being contrarian pays off. Your picks stay private until the event ends. Play on real-world events with real stakes.
            </p>
            
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <button className="flex items-center gap-2 rounded-[14px] bg-[#09090b] px-6 py-3 text-sm font-medium text-white transition-all hover:bg-[#27272a]">
                Start Playing
                <ArrowRightIcon />
              </button>
              <button className="rounded-[14px] border border-[#3f3f46] bg-white px-6 py-3 text-sm font-medium text-[#3f3f46] transition-all hover:border-[#09090b] hover:text-[#09090b]">
                View Documentation
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Row */}
      <section className="border-y border-[#ececee] bg-white py-12">
        <div className="mx-auto grid max-w-[1200px] grid-cols-3 gap-8 px-6">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="text-[56px] font-semibold text-[#09090b]">{stat.value}</div>
              <div className="text-sm text-[#71717a]">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Games Section */}
      <section id="games" className="py-20">
        <div className="mx-auto max-w-[1200px] px-6">
          <div className="mb-12 text-center">
            <h2 className="mb-4 text-[40px] font-semibold text-[#09090b]">Featured Games</h2>
            <p className="text-lg text-[#71717a]">
              Pick your game and start predicting
            </p>
          </div>
          
          <div className="grid gap-8 md:grid-cols-2">
            {games.map((game) => (
              <div
                key={game.id}
                className={`group relative overflow-hidden rounded-[36px] border border-[#ececee] bg-white ${game.comingSoon ? 'opacity-75' : ''}`}
              >
                {/* Game Image Placeholder */}
                <div className="aspect-video bg-gradient-to-br from-[#f4f4f5] to-[#ececee]">
                  <div className="flex h-full w-full items-center justify-center">
                    <div className="text-center">
                      <div className="mb-4 flex justify-center">
                        {game.id === "minority-wins" ? (
                          <div className="flex h-16 w-16 items-center justify-center rounded-[40px] bg-[#ff5a00]/10 text-[#ff5a00]">
                            <GamepadIcon />
                          </div>
                        ) : (
                          <div className="flex h-16 w-16 items-center justify-center rounded-[40px] bg-[#3f3f46]/10 text-[#3f3f46]">
                            <TrophyIcon />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Game Content */}
                <div className="p-8">
                  <div className="mb-4 flex items-center gap-3">
                    <span className={`rounded-[12px] ${game.statusColor} px-3 py-1 text-xs font-medium text-white`}>
                      {game.status}
                    </span>
                    <span className="rounded-[12px] border border-[#ececee] px-3 py-1 text-xs font-medium text-[#52525b]">
                      FHE Private
                    </span>
                  </div>
                  
                  <h3 className="mb-3 text-[20px] font-semibold text-[#09090b]">
                    {game.title}
                  </h3>
                  
                  <p className="mb-6 text-[15px] leading-relaxed text-[#71717a]">
                    {game.description}
                  </p>
                  
                  <button
                    className={`flex w-full items-center justify-center gap-2 rounded-[14px] px-4 py-3 text-sm font-medium transition-all ${
                      game.comingSoon
                        ? 'cursor-not-allowed bg-[#f4f4f5] text-[#71717a]'
                        : 'bg-[#09090b] text-white hover:bg-[#27272a]'
                    }`}
                    disabled={game.comingSoon}
                  >
                    {game.comingSoon ? 'Coming Soon' : 'Play Now'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="how-it-works" className="border-y border-[#ececee] bg-white py-20">
        <div className="mx-auto max-w-[1200px] px-6">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-[40px] font-semibold text-[#09090b]">How It Works</h2>
            <p className="text-lg text-[#71717a]">
              Get started in minutes
            </p>
          </div>
          
          <div className="grid gap-8 md:grid-cols-4">
            {steps.map((step, index) => (
              <div key={index} className="relative">
                <div className="mb-4 text-[56px] font-semibold text-[#d4d4d8]">
                  {step.number}
                </div>
                <h3 className="mb-2 text-xl font-semibold text-[#09090b]">
                  {step.title}
                </h3>
                <p className="text-[15px] text-[#71717a]">
                  {step.description}
                </p>
                {index < steps.length - 1 && (
                  <div className="hidden absolute top-12 left-full w-full h-px bg-[#ececee] md:block" />
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20">
        <div className="mx-auto max-w-[1200px] px-6">
          <div className="grid gap-16 md:grid-cols-2">
            {/* Left Column - Features List */}
            <div>
              <div className="mb-8">
                <span className="mb-4 inline-block rounded-[12px] bg-[#ff5a00] px-3 py-1 text-xs font-medium text-white">
                  Why Uneventful
                </span>
                <h2 className="mb-4 text-[40px] font-semibold text-[#09090b]">
                  Built different.
                  <br />Plays different.
                </h2>
                <p className="text-lg text-[#71717a]">
                  Traditional prediction markets expose your positions. We use Fully Homomorphic Encryption to keep your picks private until settlement.
                </p>
              </div>
              
              <div className="space-y-6">
                {features.map((feature, index) => (
                  <div key={index} className="flex gap-4">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[12px] bg-[#09090b] text-white">
                      {feature.icon}
                    </div>
                    <div>
                      <h3 className="mb-1 text-lg font-semibold text-[#09090b]">
                        {feature.title}
                      </h3>
                      <p className="text-[15px] text-[#71717a]">
                        {feature.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            {/* Right Column - Dark Feature Card */}
            <div className="rounded-[36px] bg-[#27272a] p-8 text-white">
              <h3 className="mb-8 text-2xl font-semibold">
                Why Privacy Matters
              </h3>
              
              <div className="space-y-6">
                <div className="flex gap-4 border-b border-[#3f3f46] pb-6">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#ff5a00]">
                    <CheckIcon />
                  </div>
                  <div>
                    <h4 className="mb-1 font-medium">No herding behavior</h4>
                    <p className="text-sm text-[#a1a1aa]">
                      When everyone sees others&apos; picks, they copy. Privacy ensures authentic predictions.
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-4 border-b border-[#3f3f46] pb-6">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#ff5a00]">
                    <CheckIcon />
                  </div>
                  <div>
                    <h4 className="mb-1 font-medium">Fair competition</h4>
                    <p className="text-sm text-[#a1a1aa]">
                      Your strategy stays yours. No front-running or copycatting.
                    </p>
                  </div>
                </div>
                
                <div className="flex gap-4">
                  <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-[#ff5a00]">
                    <CheckIcon />
                  </div>
                  <div>
                    <h4 className="mb-1 font-medium">Surprise outcomes</h4>
                    <p className="text-sm text-[#a1a1aa]">
                      Games stay exciting. The result only reveals who picked what after time&apos;s up.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="mt-8 rounded-[16px] bg-[#09090b] p-6">
                <div className="mb-2 flex items-center gap-2">
                  <GlobeIcon />
                  <span className="font-medium">Powered by Zama FHE</span>
                </div>
                <p className="text-sm text-[#a1a1aa]">
                  Fully Homomorphic Encryption lets us compute on encrypted data. Your picks are mathematically private — not just hidden.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="border-y border-[#ececee] bg-white py-20">
        <div className="mx-auto max-w-[1200px] px-6">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="mb-6 text-[40px] font-semibold text-[#09090b]">
              Ready to play against the crowd?
            </h2>
            <p className="mb-10 text-lg text-[#71717a]">
              Join thousands of players predicting everything from award shows to election results. Your next contrarian pick could pay off.
            </p>
            
            <div className="flex flex-col items-center justify-center gap-4 sm:flex-row">
              <button className="flex items-center gap-2 rounded-[14px] bg-[#ff5a00] px-6 py-3 text-sm font-medium text-white transition-all hover:bg-[#e65100]">
                Start Playing Now
                <ArrowRightIcon />
              </button>
              <button className="rounded-[14px] border border-[#ececee] bg-[#f4f4f5] px-6 py-3 text-sm font-medium text-[#52525b] transition-all hover:border-[#3f3f46] hover:text-[#09090b]">
                Read the Docs
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12">
        <div className="mx-auto max-w-[1200px] px-6">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-[12px] bg-[#09090b]">
                <span className="text-sm font-semibold text-white">U</span>
              </div>
              <span className="text-lg font-semibold text-[#09090b]">uneventful</span>
            </div>
            
            <div className="flex items-center gap-8 text-sm text-[#71717a]">
              <a href="#" className="hover:text-[#09090b] transition-colors">Twitter</a>
              <a href="#" className="hover:text-[#09090b] transition-colors">Discord</a>
              <a href="#" className="hover:text-[#09090b] transition-colors">GitHub</a>
              <a href="#" className="hover:text-[#09090b] transition-colors">Documentation</a>
            </div>
            
            <div className="text-sm text-[#a1a1aa]">
              © 2025 Uneventful. All rights reserved.
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
