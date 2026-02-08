// Custom Risk Algorithm (Python Port)
export const calculateRisk = (asteroid) => {
    try {
        // Handle different data structures (Feed vs Watchlist)
        // Watchlist items might have flattened structure or different property names

        let diameter = 0;
        let dist = 100;
        let speed = 0;

        // Structure 1: NASA API Feed (Nested)
        if (asteroid.estimated_diameter?.meters) {
            diameter = asteroid.estimated_diameter.meters.estimated_diameter_max;
            if (asteroid.close_approach_data?.[0]) {
                dist = parseFloat(asteroid.close_approach_data[0].miss_distance.astronomical);
                speed = parseFloat(asteroid.close_approach_data[0].relative_velocity.kilometers_per_second);
            }
        }
        // Structure 2: Watchlist (might be flattened or stored differently)
        // Adjust this based on how you store data in MongoDB
        else if (asteroid.diameter_max_meters || asteroid.diameter) {
            diameter = asteroid.diameter_max_meters || asteroid.diameter || 0;
            dist = parseFloat(asteroid.miss_distance_astronomical || 100);
            speed = parseFloat(asteroid.velocity_kps || 0);
        }

        let sizePoints = (diameter / 1000) * 40;
        if (sizePoints > 40) sizePoints = 40;

        let distPoints = 0;
        if (dist < 0.05) {
            distPoints = 40 * (1 - (dist / 0.05));
        }

        let speedPoints = (speed / 40) * 20;
        if (speedPoints > 20) speedPoints = 20;

        return Math.round(sizePoints + distPoints + speedPoints);
    } catch (e) {
        console.error("Risk calc error", e);
        return 0;
    }
};
