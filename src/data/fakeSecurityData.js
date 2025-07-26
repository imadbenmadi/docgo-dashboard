const generateFakeSecurityData = () => {
    const statuses = ["SUCCESS", "FAILED", "BLOCKED"];
    const threatLevels = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];
    const locations = [
        "New York, USA",
        "London, UK",
        "Paris, France",
        "Tokyo, Japan",
        "Sydney, Australia",
        "Berlin, Germany",
        "Toronto, Canada",
        "Moscow, Russia",
        "Mumbai, India",
        "São Paulo, Brazil",
        "Lagos, Nigeria",
        "Cairo, Egypt",
    ];

    const browsers = [
        "Chrome 121.0.0.0",
        "Firefox 122.0.1",
        "Safari 17.3.1",
        "Edge 121.0.2277.83",
        "Opera 106.0.4998.70",
    ];

    const operatingSystems = [
        "Windows 11",
        "Windows 10",
        "macOS Sonoma",
        "macOS Ventura",
        "Ubuntu 22.04",
        "iOS 17.3",
        "Android 14",
    ];

    const deviceTypes = ["Desktop", "Mobile", "Tablet"];

    const threatReasons = [
        "Multiple failed attempts",
        "Unusual location",
        "Suspicious IP range",
        "Known VPN/Proxy",
        "Different device fingerprint",
        "Rapid successive attempts",
        "Geographically impossible travel",
        "Blacklisted IP address",
        "Bot-like behavior detected",
        "Password spray attack pattern",
    ];

    const failureReasons = [
        "Invalid credentials",
        "Account locked",
        "Too many attempts",
        "IP blocked",
        "Account suspended",
        "Invalid session",
    ];

    const adminEmails = [
        "admin@docgo.com",
        "john.doe@docgo.com",
        "sarah.smith@docgo.com",
        "mike.wilson@docgo.com",
        "lisa.johnson@docgo.com",
        "david.brown@docgo.com",
    ];

    // Generate random IP address
    const generateIP = () => {
        return `${Math.floor(Math.random() * 255)}.${Math.floor(
            Math.random() * 255
        )}.${Math.floor(Math.random() * 255)}.${Math.floor(
            Math.random() * 255
        )}`;
    };

    // Generate random date within last 30 days
    const generateRandomDate = () => {
        const now = new Date();
        const thirtyDaysAgo = new Date(
            now.getTime() - 30 * 24 * 60 * 60 * 1000
        );
        const randomTime =
            thirtyDaysAgo.getTime() +
            Math.random() * (now.getTime() - thirtyDaysAgo.getTime());
        return new Date(randomTime);
    };

    // Generate a single login attempt
    const generateLoginAttempt = (id) => {
        const status = statuses[Math.floor(Math.random() * statuses.length)];
        const isThreat = Math.random() < 0.2; // 20% chance of being a threat
        const threatLevel = isThreat
            ? threatLevels[Math.floor(Math.random() * threatLevels.length)]
            : null;

        return {
            id: id,
            timestamp: generateRandomDate().toISOString(),
            adminId: Math.floor(Math.random() * 6) + 1,
            admin: {
                email: adminEmails[
                    Math.floor(Math.random() * adminEmails.length)
                ],
            },
            loginStatus: status,
            failureReason:
                status !== "SUCCESS"
                    ? failureReasons[
                          Math.floor(Math.random() * failureReasons.length)
                      ]
                    : null,
            ipAddress: generateIP(),
            location: locations[Math.floor(Math.random() * locations.length)],
            browser: browsers[Math.floor(Math.random() * browsers.length)],
            os: operatingSystems[
                Math.floor(Math.random() * operatingSystems.length)
            ],
            deviceType:
                deviceTypes[Math.floor(Math.random() * deviceTypes.length)],
            isThreat: isThreat,
            threatLevel: threatLevel,
            threatReasons: isThreat
                ? [
                      threatReasons[
                          Math.floor(Math.random() * threatReasons.length)
                      ],
                      threatReasons[
                          Math.floor(Math.random() * threatReasons.length)
                      ],
                  ].filter((v, i, a) => a.indexOf(v) === i)
                : [], // Remove duplicates
        };
    };

    // Generate multiple login attempts
    const generateLogins = (count = 50) => {
        const logins = [];
        for (let i = 1; i <= count; i++) {
            logins.push(generateLoginAttempt(i));
        }
        return logins.sort(
            (a, b) => new Date(b.timestamp) - new Date(a.timestamp)
        ); // Sort by most recent first
    };

    // Generate statistics
    const generateStats = (logins) => {
        const totalLogins = logins.length;
        const successfulLogins = logins.filter(
            (login) => login.loginStatus === "SUCCESS"
        ).length;
        const threatenedLogins = logins.filter(
            (login) => login.isThreat
        ).length;
        const uniqueIPs = new Set(logins.map((login) => login.ipAddress)).size;

        const now = new Date();
        const twentyFourHoursAgo = new Date(
            now.getTime() - 24 * 60 * 60 * 1000
        );
        const last24Hours = logins.filter(
            (login) => new Date(login.timestamp) > twentyFourHoursAgo
        ).length;

        return {
            totalLogins: totalLogins,
            successRate:
                totalLogins > 0
                    ? Math.round((successfulLogins / totalLogins) * 100)
                    : 0,
            threatenedLogins: threatenedLogins,
            threatRate:
                totalLogins > 0
                    ? Math.round((threatenedLogins / totalLogins) * 100)
                    : 0,
            uniqueIPs: uniqueIPs,
            recentActivity: {
                last24Hours: last24Hours,
            },
        };
    };

    // Generate pagination
    const generatePagination = (totalCount, currentPage = 1, limit = 20) => {
        const totalPages = Math.ceil(totalCount / limit);
        return {
            currentPage: currentPage,
            totalPages: totalPages,
            totalCount: totalCount,
            hasNext: currentPage < totalPages,
            hasPrev: currentPage > 1,
            limit: limit,
        };
    };

    // Main function to generate complete security data
    const generateCompleteSecurityData = (options = {}) => {
        const {
            totalLogins = 150,
            currentPage = 1,
            limit = 20,
            filters = {},
        } = options;

        // Generate all logins
        let allLogins = generateLogins(totalLogins);

        // Apply filters if provided
        if (filters.status) {
            allLogins = allLogins.filter(
                (login) => login.loginStatus === filters.status
            );
        }

        if (filters.threatLevel) {
            allLogins = allLogins.filter(
                (login) => login.threatLevel === filters.threatLevel
            );
        }

        if (filters.isThreat !== undefined && filters.isThreat !== "") {
            const isThreatFilter = filters.isThreat === "true";
            allLogins = allLogins.filter(
                (login) => login.isThreat === isThreatFilter
            );
        }

        if (filters.startDate) {
            const startDate = new Date(filters.startDate);
            allLogins = allLogins.filter(
                (login) => new Date(login.timestamp) >= startDate
            );
        }

        if (filters.endDate) {
            const endDate = new Date(filters.endDate);
            endDate.setHours(23, 59, 59, 999); // End of day
            allLogins = allLogins.filter(
                (login) => new Date(login.timestamp) <= endDate
            );
        }

        // Paginate the results
        const startIndex = (currentPage - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedLogins = allLogins.slice(startIndex, endIndex);

        return {
            logins: paginatedLogins,
            stats: generateStats(allLogins),
            pagination: generatePagination(
                allLogins.length,
                currentPage,
                limit
            ),
        };
    };

    return {
        generateCompleteSecurityData,
        generateLogins,
        generateStats,
        generatePagination,
    };
};

// Export the generator
export default generateFakeSecurityData;

// Example usage:
export const getFakeSecurityData = (options = {}) => {
    const generator = generateFakeSecurityData();
    return generator.generateCompleteSecurityData(options);
};

// Quick access to empty state
export const getEmptySecurityData = () => {
    return {
        logins: [],
        stats: {
            totalLogins: 0,
            successRate: 0,
            threatenedLogins: 0,
            threatRate: 0,
            uniqueIPs: 0,
            recentActivity: {
                last24Hours: 0,
            },
        },
        pagination: {
            currentPage: 1,
            totalPages: 0,
            totalCount: 0,
            hasNext: false,
            hasPrev: false,
            limit: 20,
        },
    };
};

// Sample data for immediate use
export const sampleSecurityData = getFakeSecurityData({
    totalLogins: 75,
    currentPage: 1,
    limit: 20,
});
