import inquirer from "inquirer";
import { getPlan, refinePlan } from "./agent.js"
import { executePlan } from "./executor.js";

async function main() {
  console.log("=== AI Task Executor ===");
  const conversationHistory = [];
  let userTask = (
    await inquirer.prompt([
      {
        type: "input",
        name: "task",
        message: "What task would you like the AI to perform?",
      },
    ])
  ).task;
  let plan = await getPlan(userTask, conversationHistory);
  while (true) {
    console.log("\nAI-suggested plan:\n");
    console.log(plan);

    const confirm = await inquirer.prompt([
      {
        type: "confirm",
        name: "approved",
        message: "Do you want to execute this plan locally?",
      },
    ]);

    if (!confirm.approved) {
      console.log("Aborting. No actions were executed.");
      process.exit(0);
    }

    try {
      await executePlan(plan);
    } catch (error) {
      console.log("Execution error:", error.message);
    }
    const successCheck = await inquirer.prompt([
      {
        type: "confirm",
        name: "wasSuccessful",
        message: "Did the plan succeed in accomplishing your task?",
      },
    ]);

    if (successCheck.wasSuccessful) {
      console.log("Task completed successfully! Exiting...");
      break;
    } else {
      const { failureReason } = await inquirer.prompt([
        {
          type: "input",
          name: "failureReason",
          message: "Why did the task fail? (Short explanation)",
        },
      ]);

      plan = await refinePlan(failureReason, conversationHistory);
    }
  }
}

main().catch((err) => console.error(err));
