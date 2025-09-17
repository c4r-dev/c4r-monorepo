#!/usr/bin/env node

const fs = require('fs');
const path = require('path');

class TailwindConfigFixer {
    constructor() {
        this.baseDir = process.cwd();
        this.fixedCount = 0;
        this.shadcnConfig = {
            content: [
                './pages/**/*.{js,ts,jsx,tsx,mdx}',
                './components/**/*.{js,ts,jsx,tsx,mdx}',
                './app/**/*.{js,ts,jsx,tsx,mdx}',
                './src/**/*.{js,ts,jsx,tsx,mdx}',
            ],
            theme: {
                container: {
                    center: true,
                    padding: "2rem",
                    screens: {
                        "2xl": "1400px",
                    },
                },
                extend: {
                    colors: {
                        border: "hsl(var(--border))",
                        input: "hsl(var(--input))",
                        ring: "hsl(var(--ring))",
                        background: "hsl(var(--background))",
                        foreground: "hsl(var(--foreground))",
                        primary: {
                            DEFAULT: "hsl(var(--primary))",
                            foreground: "hsl(var(--primary-foreground))",
                        },
                        secondary: {
                            DEFAULT: "hsl(var(--secondary))",
                            foreground: "hsl(var(--secondary-foreground))",
                        },
                        destructive: {
                            DEFAULT: "hsl(var(--destructive))",
                            foreground: "hsl(var(--destructive-foreground))",
                        },
                        muted: {
                            DEFAULT: "hsl(var(--muted))",
                            foreground: "hsl(var(--muted-foreground))",
                        },
                        accent: {
                            DEFAULT: "hsl(var(--accent))",
                            foreground: "hsl(var(--accent-foreground))",
                        },
                        popover: {
                            DEFAULT: "hsl(var(--popover))",
                            foreground: "hsl(var(--popover-foreground))",
                        },
                        card: {
                            DEFAULT: "hsl(var(--card))",
                            foreground: "hsl(var(--card-foreground))",
                        },
                    },
                    borderRadius: {
                        lg: "var(--radius)",
                        md: "calc(var(--radius) - 2px)",
                        sm: "calc(var(--radius) - 4px)",
                    },
                    keyframes: {
                        "accordion-down": {
                            from: { height: 0 },
                            to: { height: "var(--radix-accordion-content-height)" },
                        },
                        "accordion-up": {
                            from: { height: "var(--radix-accordion-content-height)" },
                            to: { height: 0 },
                        },
                    },
                    animation: {
                        "accordion-down": "accordion-down 0.2s ease-out",
                        "accordion-up": "accordion-up 0.2s ease-out",
                    },
                },
            },
            plugins: [],
        };
    }

    findActivitiesWithTailwindIssues() {
        const activitiesDir = path.join(this.baseDir, 'activities');
        const activities = [];
        
        const domains = fs.readdirSync(activitiesDir).filter(item => 
            fs.statSync(path.join(activitiesDir, item)).isDirectory()
        );
        
        for (const domain of domains) {
            const domainPath = path.join(activitiesDir, domain);
            const activityNames = fs.readdirSync(domainPath).filter(item => 
                fs.statSync(path.join(domainPath, item)).isDirectory()
            );
            
            for (const activityName of activityNames) {
                const activityPath = path.join(domainPath, activityName);
                const tailwindConfigPath = path.join(activityPath, 'tailwind.config.js');
                const globalsPath = path.join(activityPath, 'app', 'globals.css');
                
                // Check if this activity has Tailwind issues
                if (fs.existsSync(tailwindConfigPath) && fs.existsSync(globalsPath)) {
                    const globalsContent = fs.readFileSync(globalsPath, 'utf8');
                    
                    // Check if it uses shadcn/ui patterns
                    if (globalsContent.includes('bg-background') || 
                        globalsContent.includes('text-foreground') ||
                        globalsContent.includes('--background:') ||
                        globalsContent.includes('--foreground:')) {
                        
                        const configContent = fs.readFileSync(tailwindConfigPath, 'utf8');
                        
                        // Check if config is incomplete
                        if (configContent.includes('content: []') || 
                            !configContent.includes('background: "hsl(var(--background))"')) {
                            
                            activities.push({
                                name: activityName,
                                domain,
                                path: activityPath,
                                tailwindConfigPath,
                                route: `/${domain}/${activityName}`
                            });
                        }
                    }
                }
            }
        }
        
        return activities;
    }

    fixTailwindConfig(activity) {
        const configPath = activity.tailwindConfigPath;
        
        try {
            console.log(`🔧 Fixing Tailwind config: ${activity.route}`);
            
            const newConfig = `/** @type {import('tailwindcss').Config} */
module.exports = ${JSON.stringify(this.shadcnConfig, null, 2)}
`;
            
            fs.writeFileSync(configPath, newConfig);
            console.log(`   ✅ Fixed: ${configPath}`);
            this.fixedCount++;
            
        } catch (error) {
            console.error(`   ❌ Error fixing ${activity.route}:`, error.message);
        }
    }

    async fixAllConfigs() {
        console.log('🔍 Finding activities with Tailwind CSS issues...');
        
        const activities = this.findActivitiesWithTailwindIssues();
        console.log(`📦 Found ${activities.length} activities with Tailwind issues\n`);
        
        if (activities.length === 0) {
            console.log('✅ No Tailwind configuration issues found!');
            return;
        }

        console.log('🔧 Fixing Tailwind configurations...\n');
        
        for (const activity of activities) {
            this.fixTailwindConfig(activity);
        }
        
        console.log(`\n🎉 Fixed ${this.fixedCount} Tailwind configurations!`);
        console.log('\n📋 Summary of fixed activities:');
        activities.forEach(activity => {
            console.log(`   • ${activity.route}`);
        });
    }
}

async function main() {
    const fixer = new TailwindConfigFixer();
    await fixer.fixAllConfigs();
}

if (require.main === module) {
    main().catch(console.error);
}

module.exports = { TailwindConfigFixer };