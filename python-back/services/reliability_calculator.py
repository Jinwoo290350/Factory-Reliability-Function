"""
Reliability Calculation Service
Implements two methods for calculating Weibull parameters and reliability:
1. Default Method: Using Mean Time (MT) and Standard Deviation (SD)
2. Manual Method: Using Maximum Likelihood Estimation (MLE) from manual failure hours
"""
import numpy as np
from scipy.optimize import minimize, fsolve
import scipy.special as sp_special
from typing import List, Tuple, Optional


class ReliabilityCalculator:
    """Calculate reliability using Weibull distribution"""

    @staticmethod
    def calculate_from_mean_sd(mean_time: float, std_deviation: float) -> Tuple[float, float]:
        """
        Method 1: Calculate Weibull parameters (alpha, beta) from Mean and Standard Deviation

        Uses the relationships:
        - mean = beta * Gamma(1 + 1/alpha)
        - variance = beta^2 * [Gamma(1 + 2/alpha) - Gamma(1 + 1/alpha)^2]

        Args:
            mean_time: Mean Time Between Failures (MTBF)
            std_deviation: Standard Deviation

        Returns:
            Tuple of (alpha/shape, beta/scale) parameters
        """
        variance = std_deviation ** 2

        def equations(vars):
            alpha, beta = vars
            # Equation 1: mean = beta * Gamma(1 + 1/alpha)
            eq1 = beta * sp_special.gamma(1 + 1/alpha) - mean_time
            # Equation 2: variance = beta^2 * [Gamma(1 + 2/alpha) - Gamma(1 + 1/alpha)^2]
            eq2 = (beta ** 2) * (sp_special.gamma(1 + 2/alpha) - (sp_special.gamma(1 + 1/alpha)) ** 2) - variance
            return [eq1, eq2]

        # Initial guess
        initial_guess = [2.0, mean_time]

        try:
            solution = fsolve(equations, initial_guess)
            alpha, beta = solution

            # Ensure positive values
            alpha = max(0.1, abs(alpha))
            beta = max(0.1, abs(beta))

            return alpha, beta
        except Exception as e:
            print(f"Error in solve_from_mean_sd: {e}")
            # Fallback to simple exponential (alpha=1)
            return 1.0, mean_time

    @staticmethod
    def calculate_from_manual_hours(failure_hours: List[float]) -> Tuple[float, float]:
        """
        Method 2: Calculate Weibull parameters using Maximum Likelihood Estimation (MLE)

        Minimizes the negative log-likelihood function:
        -L = -n*ln(alpha) + n*ln(beta) - (alpha-1)*sum(ln((t-gamma)/beta)) + sum(((t-gamma)/beta)^alpha)

        where gamma = 0 (two-parameter Weibull)

        Args:
            failure_hours: List of failure times (manual input from user)

        Returns:
            Tuple of (alpha/shape, beta/scale) parameters
        """
        if not failure_hours or len(failure_hours) == 0:
            raise ValueError("failure_hours must contain at least one value")

        ts = np.array(failure_hours)
        n = len(ts)

        def negative_log_likelihood(params):
            """Negative log-likelihood function to minimize"""
            alpha, beta = params

            if alpha <= 0 or beta <= 0:
                return 1e10  # Large penalty for invalid parameters

            try:
                ln_alpha = n * np.log(alpha)
                ln_beta = n * np.log(beta)
                sum_ln = np.sum(np.log(ts / beta))
                sum_alpha = np.sum((ts / beta) ** alpha)

                # Log-likelihood (we want to maximize this)
                L = ln_alpha - ln_beta + (alpha - 1) * sum_ln - sum_alpha

                # Return negative for minimization
                return -L
            except (ValueError, OverflowError, RuntimeWarning):
                return 1e10

        # Initial guess
        mean_val = np.mean(ts)
        initial_params = [2.0, mean_val]

        # Bounds: alpha > 0, beta > 0
        bounds = ((0.1, None), (0.1, None))

        try:
            result = minimize(
                negative_log_likelihood,
                initial_params,
                bounds=bounds,
                method='L-BFGS-B'
            )

            if result.success:
                alpha, beta = result.x
                return alpha, beta
            else:
                print(f"Optimization failed: {result.message}")
                # Fallback to method of moments
                mean_val = np.mean(ts)
                std_val = np.std(ts)
                return ReliabilityCalculator.calculate_from_mean_sd(mean_val, std_val)
        except Exception as e:
            print(f"Error in MLE optimization: {e}")
            # Fallback
            mean_val = np.mean(ts)
            return 1.0, mean_val

    @staticmethod
    def calculate_reliability(alpha: float, beta: float, time: float) -> float:
        """
        Calculate reliability at given time using Weibull distribution

        R(t) = e^(-(t/beta)^alpha)

        Args:
            alpha: Shape parameter
            beta: Scale parameter
            time: Time point to calculate reliability

        Returns:
            Reliability value (0 to 1)
        """
        if time < 0 or beta <= 0 or alpha <= 0:
            return 0.0

        try:
            reliability = np.exp(-((time / beta) ** alpha))
            return float(reliability)
        except (OverflowError, ValueError):
            return 0.0

    @staticmethod
    def calculate_standard_reliability(
        mean_time: Optional[float] = None,
        std_deviation: Optional[float] = None,
        manual_hours: Optional[List[float]] = None,
        time: float = 1.0
    ) -> Tuple[float, float, float]:
        """
        Calculate standard reliability using appropriate method

        If manual_hours is provided and not empty, use Method 2 (MLE)
        Otherwise, use Method 1 (Mean & SD)

        Args:
            mean_time: Mean Time (MT) - used for Method 1
            std_deviation: Standard Deviation (SD) - used for Method 1
            manual_hours: List of manual failure hours - used for Method 2
            time: Time point for reliability calculation (default: 1 hour)

        Returns:
            Tuple of (alpha, beta, reliability)
        """
        # Determine which method to use
        if manual_hours and len(manual_hours) > 0:
            # Method 2: MLE from manual hours
            alpha, beta = ReliabilityCalculator.calculate_from_manual_hours(manual_hours)
        elif mean_time is not None and std_deviation is not None and std_deviation > 0:
            # Method 1: From Mean and SD
            alpha, beta = ReliabilityCalculator.calculate_from_mean_sd(mean_time, std_deviation)
        else:
            # Fallback: Simple exponential with default MTBF
            alpha, beta = 1.0, mean_time if mean_time else 1000.0

        # Calculate reliability at given time
        reliability = ReliabilityCalculator.calculate_reliability(alpha, beta, time)

        return alpha, beta, reliability


# Example usage
if __name__ == "__main__":
    calc = ReliabilityCalculator()

    # Test Method 1: Mean & SD
    print("=== Method 1: Mean & SD ===")
    mt = 31.79
    sd = 67.43
    alpha1, beta1 = calc.calculate_from_mean_sd(mt, sd)
    r1 = calc.calculate_reliability(alpha1, beta1, 1.0)
    print(f"MT={mt}, SD={sd}")
    print(f"Alpha (shape): {alpha1:.4f}")
    print(f"Beta (scale): {beta1:.4f}")
    print(f"Reliability at t=1: {r1:.12f}")

    # Test Method 2: Manual Hours
    print("\n=== Method 2: Manual Hours (MLE) ===")
    manual = [500.0, 550.0, 580.0, 600.0]
    alpha2, beta2 = calc.calculate_from_manual_hours(manual)
    r2 = calc.calculate_reliability(alpha2, beta2, 1.0)
    print(f"Manual hours: {manual}")
    print(f"Alpha (shape): {alpha2:.4f}")
    print(f"Beta (scale): {beta2:.4f}")
    print(f"Reliability at t=1: {r2:.12f}")

    # Test calculate_standard_reliability wrapper
    print("\n=== Wrapper Function Test ===")
    alpha3, beta3, r3 = calc.calculate_standard_reliability(
        manual_hours=manual,
        time=1.0
    )
    print(f"Using manual hours")
    print(f"Alpha: {alpha3:.4f}, Beta: {beta3:.4f}, R(1): {r3:.12f}")
