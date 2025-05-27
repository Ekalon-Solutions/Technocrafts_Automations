import {
    Paper,
    alpha,
  } from "@mui/material";
  import { motion } from "framer-motion";
  import { useLocalStorage } from "../hooks/useLocalStorage";
  import Layout from "../Components/Layout";
  
  const ProfilePage = () => {
    const { storedValue: user } = useLocalStorage("user", null);
    const { storedValue: authToken } = useLocalStorage("token", "");
  
    const mainBlue = '#1a2b4b';
  
    return (
      <Layout>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <Paper
            elevation={0}
            sx={{
              width: "100%",
              mx: "auto",
              borderRadius: "20px",
              backgroundColor: '#f8f9fa',
              p: 3,
              boxShadow: `0 4px 6px ${alpha(mainBlue, 0.1)}`,
            }}
          >
            {/* New Unified Profile section */}
            <motion.div
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <Paper
                elevation={0}
                sx={{
                  p: 0,
                  borderRadius: "12px",
                  backgroundColor: 'white',
                  mb: 3,
                  overflow: 'hidden'
                }}
              >
                  Bill Of Materials Creator
              </Paper>
            </motion.div>
          </Paper>
        </motion.div>
      </Layout>
    );
  };
  
  export default ProfilePage;