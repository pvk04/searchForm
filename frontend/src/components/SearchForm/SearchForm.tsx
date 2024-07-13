import React, { useState, useRef } from "react";
import { useForm, Controller } from "react-hook-form";
import MaskedInput from "react-text-mask";
import axios, { CancelTokenSource } from "axios";
import { Container, TextField, Button, CircularProgress, Typography, List, ListItem, ListItemText, Box } from "@mui/material";
import { styled } from "@mui/system";

interface User {
	email: string;
	number: string;
}

interface FormData {
	email: string;
	number: string;
}

const FullHeightContainer = styled(Container)({
	display: "flex",
	flexDirection: "column",
	height: "100vh",
	padding: "10px",
});

const FlexBox = styled(Box)({
	display: "flex",
	flexDirection: "column",
	flexGrow: 1,
	border: "1px solid #ddd",
	borderRadius: "8px",
	padding: "16px",
	margin: 0,
	overflow: "hidden",
});

const ScrollableList = styled(List)({
	flexGrow: 1,
	overflowY: "auto",
});

const CenteredCircularProgress = styled(CircularProgress)({
	margin: "auto",
});

const SearchForm: React.FC = () => {
	const {
		control,
		handleSubmit,
		formState: { errors },
	} = useForm<FormData>({
		defaultValues: {
			email: "",
			number: "",
		},
	});
	const [results, setResults] = useState<User[]>([]);
	const [error, setErrorState] = useState<string>("");
	const [loading, setLoading] = useState<boolean>(false);
	const [noResultsMessage, setNoResultsMessage] = useState<string>("");

	const currentRequest = useRef<CancelTokenSource | null>(null);

	const onSubmit = async (data: FormData) => {
		const { email, number } = data;

		setErrorState("");
		setResults([]);
		setNoResultsMessage("");

		if (currentRequest.current) {
			currentRequest.current.cancel("Operation canceled due to new request.");
		}

		const newSource = axios.CancelToken.source();
		currentRequest.current = newSource;

		setLoading(true);

		try {
			const response = await axios.post(
				"http://localhost:3001/search",
				{ email, number: number.replace(/-/g, "") },
				{ cancelToken: newSource.token }
			);

			const foundUsers: User[] = response.data.map(({ number, ...user }: User) => ({
				...user,
				number: number.replace(/(\d{2})(\d{2})(\d{2})/, "$1-$2-$3"),
			}));

			if (foundUsers.length === 0) {
				setNoResultsMessage("No results found.");
			}

			setResults(foundUsers);
		} catch (thrown) {
			if (axios.isCancel(thrown)) {
				console.log("Request canceled: ", thrown.message);
			} else {
				setErrorState("Error fetching data");
			}
		} finally {
			if (currentRequest.current === newSource) {
				setLoading(false);
				currentRequest.current = null;
			}
		}
	};

	return (
		<FullHeightContainer maxWidth="sm">
			<Box my={4}>
				<Typography variant="h4" component="h1" gutterBottom>
					Search Users
				</Typography>
				<form onSubmit={handleSubmit(onSubmit)} noValidate>
					<Box mb={3}>
						<Controller
							name="email"
							control={control}
							rules={{
								required: "Email is required",
								pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Invalid email address" },
							}}
							render={({ field }) => (
								<TextField
									{...field}
									label="Email"
									variant="outlined"
									fullWidth
									error={!!errors.email}
									helperText={errors.email ? errors.email.message : ""}
								/>
							)}
						/>
					</Box>
					<Box mb={3}>
						<Controller
							name="number"
							control={control}
							rules={{
								validate: (value) => {
									if (value && value.replace(/-/g, "").length !== 6) return "Invalid number format";
									return true;
								},
							}}
							render={({ field }) => (
								<TextField
									{...field}
									label="Number"
									variant="outlined"
									fullWidth
									InputProps={{
										inputComponent: MaskedInput as any,
										inputProps: {
											mask: [/\d/, /\d/, "-", /\d/, /\d/, "-", /\d/, /\d/],
											placeholder: "12-34-56",
											guide: false,
										},
									}}
									error={!!errors.number}
									helperText={errors.number ? errors.number.message : ""}
								/>
							)}
						/>
					</Box>
					<Button type="submit" variant="contained" color="primary" fullWidth>
						Submit
					</Button>
				</form>
			</Box>
			<FlexBox mt={4}>
				{loading && <CenteredCircularProgress />}
				{error && (
					<Typography color="error" mt={2}>
						{error}
					</Typography>
				)}
				{noResultsMessage && <Typography mt={2}>{noResultsMessage}</Typography>}
				{results.length > 0 && (
					<>
						<Typography variant="h5" component="h2">
							Results:
						</Typography>
						<ScrollableList>
							{results.map((user, index) => (
								<ListItem key={index}>
									<ListItemText primary={user.email} secondary={user.number} />
								</ListItem>
							))}
						</ScrollableList>
					</>
				)}
			</FlexBox>
		</FullHeightContainer>
	);
};

export default SearchForm;
