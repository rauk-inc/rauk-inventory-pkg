// Custom Error Types for Rauk Inventory SDK
// Based on API error response structure

export interface ValidationErrorDetail {
	property: string;
	constraints: string[];
	children: ValidationErrorDetail[];
}

export interface RaukApiErrorResponse {
	success: false;
	error: {
		errors?: ValidationErrorDetail[];
		message?: string;
		name: string;
		[key: string]: any;
	};
}

export interface RaukErrorOptions {
	statusCode?: number;
	requestId?: string;
	timestamp?: string;
	context?: Record<string, any>;
}

/**
 * Base class for all Rauk SDK errors
 */
export class RaukError extends Error {
	public readonly name: string = "RaukError";
	public readonly statusCode?: number;
	public readonly requestId?: string;
	public readonly timestamp?: string;
	public readonly context?: Record<string, any>;
	public readonly originalError?: RaukApiErrorResponse;

	constructor(
		message: string,
		options: RaukErrorOptions = {},
		originalError?: RaukApiErrorResponse,
	) {
		super(message);
		this.name = this.constructor.name;
		this.statusCode = options.statusCode;
		this.requestId = options.requestId;
		this.timestamp = options.timestamp;
		this.context = options.context;
		this.originalError = originalError;

		// Maintain proper stack trace for where our error was thrown
		if (Error.captureStackTrace) {
			Error.captureStackTrace(this, this.constructor);
		}
	}

	/**
	 * Convert to a plain object for serialization
	 */
	toJSON() {
		return {
			name: this.name,
			message: this.message,
			statusCode: this.statusCode,
			requestId: this.requestId,
			timestamp: this.timestamp,
			context: this.context,
			stack: this.stack,
			originalError: this.originalError,
		};
	}
}

/**
 * Validation errors from API validation rules
 */
export class RaukValidationError extends RaukError {
	public readonly name: string = "RaukValidationError";
	public readonly validationErrors: ValidationErrorDetail[];

	constructor(
		message: string,
		validationErrors: ValidationErrorDetail[],
		options: RaukErrorOptions = {},
		originalError?: RaukApiErrorResponse,
	) {
		super(message, options, originalError);
		this.validationErrors = validationErrors;
	}

	/**
	 * Get all validation error messages flattened
	 */
	getAllMessages(): string[] {
		const messages: string[] = [];

		const extractMessages = (errors: ValidationErrorDetail[]) => {
			errors.forEach((error) => {
				messages.push(...error.constraints);
				if (error.children.length > 0) {
					extractMessages(error.children);
				}
			});
		};

		extractMessages(this.validationErrors);
		return messages;
	}

	/**
	 * Get validation errors by property path
	 */
	getErrorsForProperty(propertyPath: string): ValidationErrorDetail[] {
		const findErrors = (
			errors: ValidationErrorDetail[],
			path: string,
		): ValidationErrorDetail[] => {
			return errors
				.filter((error) => error.property === path)
				.concat(
					...errors.flatMap((error) =>
						error.children.length > 0 ? findErrors(error.children, path) : [],
					),
				);
		};

		return findErrors(this.validationErrors, propertyPath);
	}
}

/**
 * Authentication/Authorization errors
 */
export class RaukAuthenticationError extends RaukError {
	public readonly name: string = "RaukAuthenticationError";

	constructor(
		message: string = "Authentication failed",
		options: RaukErrorOptions = {},
		originalError?: RaukApiErrorResponse,
	) {
		super(message, options, originalError);
	}
}

/**
 * Network/Connection errors
 */
export class RaukNetworkError extends RaukError {
	public readonly name: string = "RaukNetworkError";

	constructor(
		message: string = "Network request failed",
		options: RaukErrorOptions = {},
		originalError?: RaukApiErrorResponse,
	) {
		super(message, options, originalError);
	}
}

/**
 * Generic API errors
 */
export class RaukApiError extends RaukError {
	public readonly name: string = "RaukApiError";

	constructor(
		message: string,
		options: RaukErrorOptions = {},
		originalError?: RaukApiErrorResponse,
	) {
		super(message, options, originalError);
	}
}

/**
 * Parse API error response into appropriate error type
 */
export function parseApiError(response: Response, errorBody: any): RaukError {
	const errorOptions: RaukErrorOptions = {
		statusCode: response.status,
		timestamp: new Date().toISOString(),
	};

	// Handle validation errors with detailed structure
	if (errorBody?.error?.errors && Array.isArray(errorBody.error.errors)) {
		const validationErrors = errorBody.error.errors as ValidationErrorDetail[];
		const allMessages = validationErrors.flatMap((error) => error.constraints);

		return new RaukValidationError(
			errorBody.error.message || allMessages.join("; "),
			validationErrors,
			errorOptions,
			errorBody,
		);
	}

	// Handle authentication errors
	if (response.status === 401 || response.status === 403) {
		return new RaukAuthenticationError(
			errorBody?.error?.message || "Authentication failed",
			errorOptions,
			errorBody,
		);
	}

	// Handle network errors
	if (response.status >= 500) {
		return new RaukNetworkError(
			errorBody?.error?.message || "Server error occurred",
			errorOptions,
			errorBody,
		);
	}

	// Generic API error
	return new RaukApiError(
		errorBody?.error?.message ||
			`API request failed with status ${response.status}`,
		errorOptions,
		errorBody,
	);
}

/**
 * Type guard to check if an error is a Rauk SDK error
 */
export function isRaukError(error: any): error is RaukError {
	return error instanceof RaukError;
}

/**
 * Type guard to check if an error is a validation error
 */
export function isValidationError(error: any): error is RaukValidationError {
	return error instanceof RaukValidationError;
}

/**
 * Type guard to check if an error is an authentication error
 */
export function isAuthenticationError(
	error: any,
): error is RaukAuthenticationError {
	return error instanceof RaukAuthenticationError;
}

/**
 * Type guard to check if an error is a network error
 */
export function isNetworkError(error: any): error is RaukNetworkError {
	return error instanceof RaukNetworkError;
}
